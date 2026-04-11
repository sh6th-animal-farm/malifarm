package com.animalfarm.backend.domain.subscription;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.animalfarm.backend.batch.AllocationBatchService;
import com.animalfarm.backend.domain.project.ProjectService;
import com.animalfarm.backend.domain.refund.RefundDTO;
import com.animalfarm.backend.domain.refund.RefundRepository;
import com.animalfarm.backend.domain.refund.RefundService;
import com.animalfarm.backend.domain.retry.ApiRetryQueueDTO;
import com.animalfarm.backend.domain.retry.ApiRetryService;
import com.animalfarm.backend.domain.retry.ApiType;
import com.animalfarm.backend.domain.subscription.dto.AllocationRequestDTO;
import com.animalfarm.backend.domain.subscription.dto.AllocationResultDTO;
import com.animalfarm.backend.domain.subscription.dto.ProjectStartCheckDTO;
import com.animalfarm.backend.domain.subscription.dto.SubscriptionApplicationDTO;
import com.animalfarm.backend.domain.subscription.dto.SubscriptionHistDTO;
import com.animalfarm.backend.domain.token.TokenRepository;
import com.animalfarm.backend.domain.token.TokenService;
import com.animalfarm.backend.domain.token.dto.TokenIssueDTO;
import com.animalfarm.backend.global.ApiResponseDTO;
import com.animalfarm.backend.global.MailService;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.http.ExternalApiClient;
import com.animalfarm.backend.global.security.SecurityUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {
	private final ApplicationContext applicationContext;
	private final SubscriptionRepository subscriptionRepository;
	private final AllocationBatchService allocationBatchService;
	private final RefundRepository refundRepository;
	private final ExternalApiClient externalApiUtil;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	@Autowired
	@Lazy
	private SubscriptionService self;

	@Autowired
	private MailService mailService;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private TokenService tokenService;

	@Autowired
	TokenRepository tokenReopsitory;

	@Autowired
	RefundService refundService;

	// 강황증권 API 서버 주소
	@Value("${api.kh-stock.url}")
	private String KH_BASE_URL;

	public boolean selectAndCancel(Long projectId) throws Exception {
		Long userId = SecurityUtil.getCurrentUserId();

		// 청약 내역 조회
		SubscriptionHistDTO subscriptionHistDTO = subscriptionRepository.selectPaid(userId, projectId);
		if (subscriptionHistDTO == null) {
			throw new Exception("청약 내역이 존재하지 않습니다.");
		}

		// 멱등성 키 생성
		String idempotencyKey = "SUB-CANCEL-" + subscriptionHistDTO.getShId();
		Map<String, String> headers = new HashMap<>();
		headers.put("X-Idempotency-Key", idempotencyKey);

		// url 생성
		String url = KH_BASE_URL + "api/project/cancel/" + subscriptionHistDTO.getExternalRefId();
		RefundDTO refundDTO = null;
		try {
			// 취소 및 환불 요청
			refundDTO = externalApiUtil.callApi(
				url,
				HttpMethod.POST,
				subscriptionHistDTO,
				new ParameterizedTypeReference<ExternalApiResponseDTO<RefundDTO>>() {
				},
				headers
			);

			if (refundDTO == null) {
				throw new Exception("환불 처리에 실패했습니다.");
			}

			log.info("[Service] 증권사 청약 취소 완료");

			afterSubsRefundRequest(subscriptionHistDTO, refundDTO);
			SubscriptionApplicationDTO cancelApplication = new SubscriptionApplicationDTO();
			cancelApplication.setSubscriptionAmount(refundDTO.getAmount().multiply(new BigDecimal("-1")));
			cancelApplication.setProjectId(refundDTO.getProjectId());
			subscriptionRepository.updatePlusAmount(cancelApplication);

		} catch (RuntimeException e) {
			// 유틸리티에서 던진 구체적인 에러 메시지("잔액 부족" 등)가 이곳으로 전달됨
			log.error("[Service] 청약 취소 실패. 재시도 큐에 등록합니다. 사유: {}", e.getMessage());

			Object[] params = new Object[] {subscriptionHistDTO.getExternalRefId()};

			ApiRetryService apiRetryService = applicationContext.getBean(
				ApiRetryService.class);
			apiRetryService.registerRetry(ApiType.SUB_CANCEL, subscriptionHistDTO,
				params, idempotencyKey);

			return false;
		}

		return true;
	}

	public boolean checkUserApplied(Long projectId) {
		try {
			// 1. SecurityUtil로 로그인 유저 ID 가져오기
			Long userId = SecurityUtil.getCurrentUserId();
			System.out.println("projectId : " + projectId);
			System.out.println("userId : " + userId);
			// 2. 비회원이면 더 볼 것도 없이 false
			if (userId == null) {
				return false;
			}
			// 3. DB 조회 (이미 만들어두신 selectPaid 쿼리 호출)
			// 결과가 null이 아니면(청약 내역이 있으면) true 반환
			SubscriptionHistDTO dto = subscriptionRepository.selectPaid(userId, projectId);
			System.out.println("dto " + dto);
			return dto != null;
		} catch (Exception e) {
			// 3. 에러 발생 시(비회원 등) 로그만 남기고 false 반환
			// 이제 서버 콘솔에 빨간 에러가 도배되지 않고 조용히 처리됩니다.
			System.out.println("비회원 또는 로그인 만료 사용자입니다. (청약 여부: false)");
			System.out.println("에러 발생 원인: " + e.getClass().getName());
			log.error("청약 여부 확인 중 예외 발생: {}", e.getMessage());
			return false;
		}
	}

	// 증권사 환불 요청 성공 이후 작업
	private void afterSubsRefundRequest(SubscriptionHistDTO subscriptionHistDTO,
		RefundDTO refundDTO) throws Exception {
		refundDTO.setShId(subscriptionHistDTO.getShId());
		refundDTO.setProjectId(subscriptionHistDTO.getProjectId());
		refundDTO.setUclId(refundDTO.getWalletId());
		refundDTO.setExternalRefId(refundDTO.getTransactionId());
		refundDTO.setUserId(subscriptionHistDTO.getUserId());
		refundDTO.setRefundType("ALL"); // 환불 완료 상태
		refundDTO.setReasonCode("USER_CANCEL"); // 사유
		refundDTO.setStatus("SUCCESS"); // 처리 상태

		subscriptionHistDTO.setSubscriptionStatus("CANCELED");
		subscriptionHistDTO.setPaymentStatus("REFUNDED");
		subscriptionHistDTO.setCanceledAt(OffsetDateTime.now());

		self.updateRefundAndSubsTable(refundDTO, subscriptionHistDTO);
	}

	// 증권사 환불 요청 "재시도" 성공 이후 작업
	public void afterSubsRefundRetry(ApiRetryQueueDTO retry,
		RefundDTO refundDTO) throws Exception {
		// 저장된 Payload(JSON)를 다시 DTO로 변환
		SubscriptionHistDTO hist = objectMapper.readValue(retry.getPayload(), SubscriptionHistDTO.class);

		afterSubsRefundRequest(hist, refundDTO);
	}

	// 환불 내역, 청약 내역 DB 수정
	@Transactional(rollbackFor = Exception.class)
	public void updateRefundAndSubsTable(RefundDTO refundDTO,
		SubscriptionHistDTO subscriptionHistDTO)
		throws Exception {
		if (refundRepository.insertRefund(refundDTO) <= 0) {
			throw new Exception("내부 환불 내역 기록 실패 (DB 오류)");
		}
		if (subscriptionRepository.update(subscriptionHistDTO) <= 0) {
			throw new Exception("청약 상태 변경 실패 (DB 오류)");
		}
	}

	public boolean subscriptionApplication(SubscriptionApplicationDTO subscriptionInsertDTO) {
		if (subscriptionInsertDTO.getUserId() == null) {
			Long userId = SecurityUtil.getCurrentUserId();
			subscriptionInsertDTO.setUserId(userId);
		}
		return subscriptionRepository.subscriptionApplication(subscriptionInsertDTO);
	}

	// 1. 외부 API 호출 (트랜잭션 없음)
	public void postApplication(SubscriptionApplicationDTO dto) {
		Long uclId = subscriptionRepository.selectUclId(dto.getUserId());
		dto.setUclId(uclId);
		String targetUrl = KH_BASE_URL + "api/project/application/" + dto.getTokenId() + "?subscriptionId="
			+ dto.getShId() + "&walletId=" + dto.getUclId() + "&amount=" + dto.getSubscriptionAmount();

		try {
			// [API 호출 전] DB 커넥션 안 잡음
			ResponseEntity<ApiResponseDTO> responseEntity = restTemplate.postForEntity(targetUrl, null,
				ApiResponseDTO.class);

			if (responseEntity.getStatusCodeValue() == 200) {
				Object payload = responseEntity.getBody().getPayload();

				if (payload != null) {
					dto.setPaymentStatus("PAID");
					dto.setExternalRefId(Long.valueOf(String.valueOf(payload)));
					// [성공 시 DB 처리 호출] 이 시점에만 트랜잭션 시작
					updateDatabaseInfo(dto);
				} else {
					dto.setPaymentStatus("FAILED");
					// [실패 시 DB 처리 호출]
					updateDatabaseInfo(dto);
					throw new RuntimeException("empty_payload");
				}
			}
		} catch (Exception e) {
			log.error("통신 실패: {}", e.getMessage());
			throw new RuntimeException(e.getMessage());
		}
	}

	// 2. 내 DB 동작 (이 메서드만 트랜잭션 처리)
	@Transactional
	public void updateDatabaseInfo(SubscriptionApplicationDTO dto) {
		// 여기서부터 DB 커넥션을 잡고 처리함
		subscriptionRepository.updateSubscriptionStatus(dto);

		if ("PAID".equals(dto.getPaymentStatus())) {
			subscriptionRepository.updatePlusAmount(dto);
		}
	}

	public void projectStartCheck() {
		List<ProjectStartCheckDTO> projectstartCheckList = subscriptionRepository.selectExpiredSubscriptions();

		for (ProjectStartCheckDTO data : projectstartCheckList) {
			try {
				// 핵심: 각 프로젝트 처리를 개별 트랜잭션으로 묶은 메서드로 넘김
				self.processIndividualProject(data);
			} catch (Exception e) {
				log.error("[프로젝트 {} 처리 중 전면 롤백] 사유: {}", data.getProjectId(), e.getMessage(), e);
			}
		}
	}

	public void processIndividualProject(ProjectStartCheckDTO data) throws Exception {
		BigDecimal rate70 = new BigDecimal("70");
		BigDecimal rate90 = new BigDecimal("90");
		BigDecimal rate100 = new BigDecimal("100");
		Long projectId = data.getProjectId();
		BigDecimal rate = data.getSubscriptionRate();
		Long tokenId = data.getTokenId();
		Long subscriberCount = 50L;// 테스트를 위해 50명 설정
		int extensionCount = data.getExtensionCount();
		if (rate.compareTo(rate70) < 0 || subscriberCount < 49) {
			System.out.println(rate + " 프로젝트 폐기");
			projectCanceled(data);
			selectAndAllCancel(projectId);
			tokenClosed(tokenId);
		} else if (rate.compareTo(rate70) >= 0 && rate.compareTo(rate90) < 0) {
			if (extensionCount == 0) {
				System.out.println(rate + " 프로젝트 종료일 +2일");
				subscriptionRepository.updateProjectTwoDay(projectId);
				noticeEmail(projectId); // 여기에 사용자에게 이메일 보내는 것 추가하기
			} else {
				System.out.println("프로젝트 폐기");
				projectCanceled(data);
				selectAndAllCancel(projectId);
				tokenClosed(tokenId);
			}
		} else if (rate.compareTo(rate90) >= 0 && rate.compareTo(rate100) < 0) {
			// 마리팜이 충당할 가격
			BigDecimal leftAmount = data.getTargetAmount()
				.subtract(data.getActualAmount())
				.setScale(0, RoundingMode.DOWN);
			SubscriptionApplicationDTO applicationDTO = new SubscriptionApplicationDTO();
			applicationDTO.setProjectId(data.getProjectId());
			applicationDTO.setSubscriptionAmount(leftAmount);
			applicationDTO.setTokenId(tokenId);
			applicationDTO.setUserId(1L);
			System.out.println(applicationDTO);
			subscriptionApplication(applicationDTO);
			System.out.println(applicationDTO);
			postApplication(applicationDTO);
			System.out.println(rate + " 마리팜 회사가 나머지 충당");
			subscriptionRepository.updateProjectInProgress(projectId);
		} else {
			TokenIssueDTO tokenData = tokenReopsitory.selectIssueToken(projectId);
			try {
				if ("READY".equals(tokenData.getStatus())) {
					projectService.postTokenIssue(tokenData);
					tokenReopsitory.updateTokenStatus(tokenId, "ISSUE_SENT");
					System.out.println("증권사 API 전송 완료: ISSUE_SENT 상태로 변경");
				} else {
					System.out.println("이미 토큰이 증권사에 있습니다.");
				}
				allocationBatchService.runAllocationBatch(data.getProjectId());
				subscriptionRepository.updateProjectInProgress(projectId);
				System.out.println(rate + " 그대로 진행");
			} catch (Exception e) {
				log.error("실패", e.getMessage());
				throw e;
			}
		}
	}

	public void projectCanceled(ProjectStartCheckDTO projectStartCheckDTO) {
		Long projectId = projectStartCheckDTO.getProjectId();
		Long tokenId = projectStartCheckDTO.getTokenId();

		// DB 업데이트 (프로젝트 상태 변경 및 토큰 삭제)
		subscriptionRepository.updateProjectCanceled(projectId);
		subscriptionRepository.updateTokenDelete("DELETED", tokenId);
		System.out.println("ID: " + projectId + " 번 프로젝트 및 토큰(" + tokenId + ") 폐기 완료");
	}

	public void noticeEmail(Long projectId) {
		List<String> userEmails = subscriptionRepository.selectUserEmail(projectId);
		for (String userEmail : userEmails) {
			mailService.sendNoticeEmail(userEmail);
		}
	}

	public void selectAndAllCancel(Long projectId) throws Exception {
		List<Long> userIds = subscriptionRepository.selectSubscriberUserIds(projectId);
		if (userIds == null || userIds.isEmpty()) {
			log.error("[Service] 청약 참여자가 없습니다. 환불 절차 없이 폐기를 진행합니다. 프로젝트 ID: {}", projectId);
			return; // 정상 종료하여 다음 로직(tokenClosed 등)이 실행되게 함
		}
		for (Long userId : userIds) {
			// 청약 내역 조회
			SubscriptionHistDTO subscriptionHistDTO = subscriptionRepository.selectPaid(userId, projectId);
			System.out.println("subscriptionHistDTO " + subscriptionHistDTO);
			if (subscriptionHistDTO == null) {
				throw new Exception("청약 내역이 존재하지 않습니다.");
			}

			// 멱등성 키 생성
			String idempotencyKey = "SUB-REJECTED-" + subscriptionHistDTO.getShId();
			Map<String, String> headers = new HashMap<>();
			headers.put("X-Idempotency-Key", idempotencyKey);

			String url = KH_BASE_URL + "api/project/cancel/" + subscriptionHistDTO.getExternalRefId();
			RefundDTO refundDTO = null;
			try {
				refundDTO = externalApiUtil.callApi(
					url,
					HttpMethod.POST,
					subscriptionHistDTO,
					new ParameterizedTypeReference<ExternalApiResponseDTO<RefundDTO>>() {
					},
					headers
				);

				if (refundDTO == null) {
					throw new Exception("환불 처리에 실패했습니다.");
				}

				log.info("[Service] 증권사 청약 취소 완료");

				projectFailRefundRequest(subscriptionHistDTO, refundDTO);

			} catch (RuntimeException e) {
				log.error("[Service] 청약 취소 실패. 재시도 큐에 등록합니다. 사유: {}", e.getMessage());

				Object[] params = new Object[] {subscriptionHistDTO.getExternalRefId()};

				ApiRetryService apiRetryService = applicationContext.getBean(
					ApiRetryService.class);
				apiRetryService.registerRetry(ApiType.SUB_CANCEL, subscriptionHistDTO,
					params, idempotencyKey);
			}
		}
	}

	// 일단 사용하지 말고 두기
	private void tokenClosed(Long tokenId) {
		String url = KH_BASE_URL + "api/project/close/" + tokenId;
		try {
			externalApiUtil.callApi(url, HttpMethod.POST, null,
				new ParameterizedTypeReference<ExternalApiResponseDTO<Object>>() {
				});

			log.info("강황 증권에 토큰 소각 완료");
		} catch (Exception e) {
			log.error("정산 실패 메시지: {}", e.getMessage());
		}
	}

	// 증권사 환불 요청 성공 이후 작업
	private void projectFailRefundRequest(SubscriptionHistDTO subscriptionHistDTO,
		RefundDTO refundDTO)
		throws Exception {
		refundDTO.setShId(subscriptionHistDTO.getShId());
		refundDTO.setProjectId(subscriptionHistDTO.getProjectId());
		refundDTO.setUclId(refundDTO.getWalletId());
		refundDTO.setExternalRefId(refundDTO.getTransactionId());
		refundDTO.setUserId(subscriptionHistDTO.getUserId());
		refundDTO.setRefundType("ALL"); // 환불 완료 상태
		refundDTO.setReasonCode("FAIL_UNDER_70"); // 사유
		refundDTO.setStatus("SUCCESS"); // 처리 상태

		subscriptionHistDTO.setSubscriptionStatus("CANCELED");
		subscriptionHistDTO.setPaymentStatus("REFUNDED");
		subscriptionHistDTO.setCanceledAt(OffsetDateTime.now());

		self.updateRefundAndSubsTable(refundDTO, subscriptionHistDTO);
	}

	// 강황증권에 토큰 배정 보내기
	public List<AllocationResultDTO> resultAllocation(Long tokenId, List<AllocationRequestDTO> allocationTokenDTO) {
		String url = KH_BASE_URL + "api/project/result/" + tokenId;
		try {
			List<AllocationResultDTO> response = externalApiUtil.callApi(url, HttpMethod.POST, allocationTokenDTO,
				new ParameterizedTypeReference<ExternalApiResponseDTO<List<AllocationResultDTO>>>() {
				});
			log.info("배정 완료 데이터 전송 성공: tokenId={}", tokenId);
			return response;
		} catch (Exception e) {
			log.error("배정 데이터 전송 중 오류 발생: {}", e.getMessage());
			throw e;
		}
	}
}
