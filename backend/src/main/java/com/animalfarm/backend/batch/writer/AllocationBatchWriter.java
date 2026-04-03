package com.animalfarm.backend.batch.writer;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import com.animalfarm.backend.domain.project.dto.TokenLedgerDTO;
import com.animalfarm.backend.domain.refund.RefundDTO;
import com.animalfarm.backend.domain.refund.RefundService;
import com.animalfarm.backend.domain.subscription.SubscriptionRepository;
import com.animalfarm.backend.domain.subscription.dto.AllocationIntermediateResult;
import com.animalfarm.backend.domain.subscription.dto.AllocationRequestDTO;
import com.animalfarm.backend.domain.subscription.dto.AllocationResultDTO;
import com.animalfarm.backend.domain.token.TokenService;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.http.ExternalApiClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AllocationBatchWriter implements ItemWriter<AllocationIntermediateResult> {

	private final TokenService tokenService;
	private final RefundService refundService;
	private final SubscriptionRepository subscriptionRepository;
	private final ExternalApiClient externalApiUtil;
	@Value("${api.kh-stock.url}")
	private String KH_BASE_URL;

	@Override
	public void write(Chunk<? extends AllocationIntermediateResult> chunk) throws Exception {
		List<? extends AllocationIntermediateResult> items = chunk.getItems();
		if (items.isEmpty())
			return;

		// 1. 증권사 API 요청 리스트 빌드 (기존 Builder 형식 100% 유지)
		List<AllocationRequestDTO> requests = items.stream()
			.map(item -> AllocationRequestDTO.builder()
				.subscriptionId(item.getInvestor().getShId())
				.walletId(item.getUclId())
				.passPrice(item.getPricePerToken())
				.passVolume(item.getResultTokenCount())
				.build())
			.collect(Collectors.toList());

		// 2. 강황증권 API 호출 (사용자님 메서드 호출)
		Long tokenId = items.get(0).getLedger().getTokenId();
		List<AllocationResultDTO> apiResults = resultAllocation(tokenId, requests);

		// 3. 결과 매핑을 위한 Map 생성
		Map<Long, AllocationResultDTO> resultMap = apiResults.stream()
			.collect(Collectors.toMap(AllocationResultDTO::getWalletId, r -> r));

		List<RefundDTO> refundList = new ArrayList<>();
		List<TokenLedgerDTO> ledgersToSave = new ArrayList<>();

		// 4. API 결과 매칭 및 환불 처리 (사용자님 Refund Builder 로직 그대로)
		for (AllocationIntermediateResult item : items) {
			AllocationResultDTO res = resultMap.get(item.getUclId());
			if (res != null) {
				TokenLedgerDTO ledger = item.getLedger();
				ledger.setExternalRefId(res.getPassTxId());
				ledger.setContractAmount(res.getPassVolume()); // 증권사 확정 수량
				ledgersToSave.add(ledger);

				// 환불 계산 및 생성
				BigDecimal refundAmount = BigDecimal.valueOf(
					item.getInvestor().getSubscriptionAmount()
						.subtract(res.getPassAmount())
						.longValue()
				).stripTrailingZeros();
				if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
					refundList.add(RefundDTO.builder()
						.userId(item.getInvestor().getUserId())
						.projectId(item.getProjectId())
						.shId(item.getInvestor().getShId())
						.uclId(item.getUclId())
						.amount(refundAmount)
						.refundType("PARTIAL")
						.reasonCode("PRO_RATA_RESIDUE")
						.status("SUCCESS")
						.externalRefId(res.getFailTxId())
						.build());
				}
				subscriptionRepository.approveSubscription(item.getInvestor().getShId());
			}
		}

		// 5. 최종 저장
		if (!ledgersToSave.isEmpty())
			tokenService.insertTokenLedger(ledgersToSave);
		if (!refundList.isEmpty())
			refundService.insertRefunds(refundList);
	}

	public List<AllocationResultDTO> resultAllocation(Long tokenId, List<AllocationRequestDTO> allocationTokenDTO) {
		String url = KH_BASE_URL + "api/project/result/" + tokenId;
		System.out.println("khAPI 호출");
		return externalApiUtil.callApi(url, HttpMethod.POST, allocationTokenDTO,
			new ParameterizedTypeReference<ExternalApiResponseDTO<List<AllocationResultDTO>>>() {
			});
	}
}