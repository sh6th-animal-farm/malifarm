package com.animalfarm.backend.domain.news;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.animalfarm.backend.domain.news.dto.LlmResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmService {

	private final RestTemplate llmRestTemplate;
	private final ObjectMapper objectMapper;

	@Value("${openai.api.url}")
	private String openAiApiUrl;

	@Value("${openai.api.key}")
	private String apiKey;

	@Value("${openai.api.model:gpt-5.4-mini}") 
	private String apiModel;

	public LlmResponseDTO ask(String factData, String type) {

		String systemPrompt = buildSystemPrompt(type);

		// OpenAI API 요청 바디(Body) 구성
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setBearerAuth(apiKey);

		Map<String, Object> messageSystem = Map.of("role", "system", "content", systemPrompt);
		Map<String, Object> messageUser = Map.of("role", "user", "content", "분석할 데이터: " + factData);

		Map<String, Object> requestBody = Map.of(
			"model", apiModel,
			"messages", List.of(messageSystem, messageUser),
			"temperature", 0.2, // 환각 방지를 위해 창의성을 낮추고 팩트 기반으로 제한 (0.0 ~ 0.3 권장)
			"response_format", Map.of("type", "json_object") // 반드시 JSON으로 응답하도록 강제
		);

		HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

		// 3. API 호출 및 예외 처리
		try {
			ResponseEntity<Map> response = llmRestTemplate.postForEntity(openAiApiUrl, requestEntity, Map.class);

			// 응답 JSON에서 content 추출
			Map<String, Object> responseBody = response.getBody();
			List<Map<String, Object>> choices = (List<Map<String, Object>>)responseBody.get("choices");
			Map<String, Object> message = (Map<String, Object>)choices.get(0).get("message");
			String content = (String)message.get("content");

			// String(JSON) -> LlmResponseDTO 객체로 매핑
			return objectMapper.readValue(content, LlmResponseDTO.class);

		} catch (Exception e) {
			log.error("[LLM API Error] 뉴스 생성 실패: {}", e.getMessage());
			// 실패 시 기본 더미 반환 (서버 다운 방지)
			return new LlmResponseDTO(
				"스마트팜 STO 시장 동향 업데이트",
				"일시적인 시스템 오류로 요약을 생성할 수 없습니다.",
				"시장 데이터를 실시간으로 수집하고 있습니다. 잠시 후 다시 확인해주세요."
			);
		}
	}

	// 프롬프트 조립 메서드
	private String buildSystemPrompt(String type) {
		StringBuilder sb = new StringBuilder();

		sb.append("당신은 24시간 스마트팜 STO 거래소의 수석 시황 분석가입니다.\n")
			.append("제공된 시장 통계(등락률, ADR, 대금)와 특징주 데이터를 분석하여, 종합 마감 시황 뉴스를 작성하세요.\n\n");

		sb.append("【스마트팜 전용 특징주 발생 시나리오 리스트】\n")
			.append("[호재 시나리오 - 특징주 등락률이 양수(+)일 때 자율 선택]\n")
			.append("- 최신 AI 양액 제어 알고리즘 도입으로 생산량 30% 증대 성공\n")
			.append("- 대형 유통사(마트, 백화점)와 프리미엄 농산물 독점 공급 계약 체결\n")
			.append("- LED 파장 최적화를 통해 영양소 2배 증대 기술 특허 취득\n")
			.append("- STO 투자자 대상 분기 수익배분 정산이 예정보다 조기 완료\n")
			.append("- 지자체 스마트팜 실증 특구 사업에 핵심 운영사로 선정\n")
			.append("- 생육 데이터 기반 신용평가 모델 고도화로 조달금리 인하 기대\n")
			.append("- 작황보험 연계 상품 출시로 하방 리스크 헤지 수단 확대\n")
			.append("- RE100 전력 PPA 계약 체결로 에너지 비용 안정성 강화\n")
			.append("- 병해충 예측 AI 정확도 개선으로 폐기율 감소 전망\n")
			.append("- 콜드체인 물류 파트너 확대 계약으로 출하 안정성 개선\n")
			.append("- STO 유통 파트너와 API 직결 완료로 거래 접근성 개선\n")
			.append("- GAP/친환경 인증 품목 확대에 따른 프리미엄 단가 기대\n")
			.append("- 해외 바이어 선도계약 체결로 중장기 매출 가시성 확보\n")
			.append("[악재 시나리오 - 특징주 등락률이 음수(-)일 때 자율 선택]\n")
			.append("- 중앙 IoT 온습도 제어 센서 통신 장애로 인한 일시적 생육 불안정\n")
			.append("- 스마트팜 시설 내 치명적인 바이러스 유입으로 방역 비상\n")
			.append("- 미승인 불법 유전자 변형(GMO) 종자 밀수 및 재배 적발로 인한 농장 폐쇄 조치\n")
			.append("- 전력 공급망 이상 및 비상 발전기 가동 지연에 따른 생산 차질 우려\n\n")
			.append("- 중앙 IoT 온습도 제어 센서 통신 장애로 일시적 생육 불안정 발생\n")
			.append("- 스마트팜 시설 내 바이러스 유입으로 방역 비용 급증\n")
			.append("- 전력 공급망 이상 및 비상 발전기 가동 지연에 따른 생산 차질 우려\n")
			.append("- 양액 공급 펌프 고장으로 일부 동 재배 구간 생육 지연\n")
			.append("- 콜드체인 배송 지연으로 신선도 저하 및 폐기율 상승 우려\n")
			.append("- 수익배분 정산 일정 지연 공지로 투자심리 위축\n")
			.append("- 규제기관의 STO 공시 보완 요구로 일정 불확실성 확대\n")
			.append("- 핵심 센서 데이터 결측 증가로 운영 신뢰도 저하 우려\n")
			.append("- 전력요금 상승과 난방비 부담 확대로 수익성 압박\n")
			.append("- 주요 유통 채널 반품률 상승으로 단기 매출 역풍\n")
			.append("[횡보 시나리오 - 특징주 등락률이 0% 내외(보합권)일 때 자율 선택]\n")
			.append("- 수확 사이클 공백 구간으로 거래 모멘텀이 제한된 관망 장세\n")
			.append("- 다음 출하 일정 확인 전까지 매수·매도 세력 균형 유지\n")
			.append("- 체결강도와 호가 잔량이 균형을 이루며 가격 박스권 유지\n")
			.append("- 기관·개인 수급이 상쇄되며 방향성 없는 횡보 흐름\n")
			.append("- 신규 계약 및 공시 이벤트 부재로 변동성 축소\n")
			.append("- 재고·출하 지표가 안정권에서 유지되며 기대감 제한\n")
			.append("- 단기 헤지 거래 비중 확대에 따른 가격 변동 억제\n")
			.append("- 호재·악재성 이슈가 혼재되어 순방향 추세 형성 실패\n")
			.append("- 환율·원자재 가격 안정세로 가격 자극 요인 부재\n")
			.append("- 규제/정책 뉴스 공백 구간에서 거래대금만 완만히 유지\n\n");

		sb.append("【필수 작성 지침】\n")
			.append(
				"0. [제목 생성 - 사건 중심]: 기사 제목(title)은 반드시 '무슨 사건이 발생했는지'가 먼저 드러나게 작성하세요. 스마트팜 STO 맥락을 반영해 28~45자 내외로 만들고, 핵심 수치 또는 핵심 특징주 1개를 포함하세요.\n")
			.append(
				"1. [수치 포맷팅]: 제공된 팩트 데이터의 수치를 기사에 적극적으로 인용하되, 모든 비율(%) 수치는 반드시 **소수점 첫째 자리**까지만 작성하세요 (예: 1468.22% -> 1468.2%, 250% -> 250.0%).\n")
			.append(
				"2. [호가 가독성]: 매수/매도 잔량 등 크기가 큰 원시 숫자(예: 552601583)는 '약 5억 5천만', '약 9천 3백' 등으로 독자가 읽기 편하게 한글 단위로 변환하여 작성하세요.\n")
			.append("3. [전체 시황]: 본문 첫 문단에는 평균등락률, ADR, 대금증감률 수치를 인용하여 시장 전체의 투심과 유동성 흐름을 객관적으로 서술하세요.\n")
			.append(
				"4. [특징주 시나리오 반영]: 특징주가 있다면, 해당 종목의 등락률과 대금증감률, 잔량 수치를 명시하고 등락률 부호에 맞춰 시나리오를 선택하세요. (+)는 호재, (-)는 악재, 0% 내외(보합권)는 횡보 시나리오를 사용해 원인을 자연스럽게 결합하세요.\n")
			.append("5. 절대 외부의 날씨(폭우 등)나 제공되지 않은 정보를 지어내지 마세요.\n\n");

		sb.append("【출력 포맷 및 예시 (JSON)】\n")
			.append("반드시 아래 JSON 구조로만 반환하세요:\n")
			.append("{\n")
			.append("  \"title\": \"정산 일정 조기 완료, 지리산 꾸지뽕원 1호 거래대금 증감률 120.0%↑\",\n")
			.append("  \"shortSummary\": \"스마트팜 STO 평균 1.5% 상승... 지리산 꾸지뽕 1호 AI 알고리즘 도입에 수급 집중\",\n")
			.append(
				"  \"textBody\": \"금일 스마트팜 STO 시장은 평균 등락률 +1.5%를 기록하며 전반적인 강세 흐름을 연출했습니다. 상승 종목이 우위를 점하며 등락비율(ADR)은 135.0%로 단기 과열권 진입 양상이 관찰됩니다. 반면 최근 3시간의 전체 거래대금은 직전 대비 20.5% 감소하며 유동성이 다소 위축되는 엇갈린 흐름을 보였습니다. 개별 특징주로는 지리산 꾸지뽕 1호가 거래대금이 120.0% 폭증하며 +8.5%의 강한 상승세를 보였습니다. 매도 잔량은 0인 반면 약 5억 5천만 규모의 매수 대기 물량이 쌓이는 극단적인 매수 쏠림이 나타났습니다. 이는 최신 AI 양액 제어 알고리즘 도입으로 생산량 30% 증대 성공 소식이 전해지며 투자 심리를 강하게 자극한 것으로 풀이됩니다.\"\n")
			.append("}");

		return sb.toString();
	}
}
