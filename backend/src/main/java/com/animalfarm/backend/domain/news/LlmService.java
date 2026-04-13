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

	@Value("${openai.api.model:gpt-4o-mini}") // 기본값으로 빠르고 저렴한 gpt-4o-mini 사용
	private String apiModel;

	public LlmResponseDTO ask(String factData, String type) {

		// 1. 완벽한 프롬프트 엔지니어링 (시스템 프롬프트)
		String systemPrompt = buildSystemPrompt(type);

		// 2. OpenAI API 요청 바디(Body) 구성
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
				"일시적인 시스템 오류로 요약을 생성할 수 없습니다.",
				"시장 데이터를 실시간으로 수집하고 있습니다. 잠시 후 다시 확인해주세요."
			);
		}
	}

	// 프롬프트 조립 메서드 (기획서 예시 반영)
	private String buildSystemPrompt(String type) {
		StringBuilder sb = new StringBuilder();

		sb.append("당신은 24시간 스마트팜 STO 거래소의 수석 시황 분석가입니다.\n")
			.append("제공된 시장 통계(등락률, ADR, 대금)와 특징주 데이터를 분석하여, 종합 마감 시황 뉴스를 작성하세요.\n\n");

		sb.append("【스마트팜 전용 특징주 발생 시나리오 리스트】\n")
			.append("[호재 시나리오 - 특징주 등락률이 양수(+)일 때 자율 선택]\n")
			.append("- 최신 AI 양액 제어 알고리즘 도입으로 생산량 30% 증대 성공\n")
			.append("- 대형 유통사(마트, 백화점)와 프리미엄 농산물 독점 공급 계약 체결\n")
			.append("- LED 파장 최적화를 통해 영양소 2배 증대 기술 특허 취득\n")
			.append("[악재 시나리오 - 특징주 등락률이 음수(-)일 때 자율 선택]\n")
			.append("- 중앙 IoT 온습도 제어 센서 통신 장애로 인한 일시적 생육 불안정\n")
			.append("- 스마트팜 시설 내 치명적인 바이러스 유입으로 방역 비상\n")
			.append("- 미승인 불법 유전자 변형(GMO) 종자 밀수 및 재배 적발로 인한 농장 폐쇄 조치\n")
			.append("- 전력 공급망 이상 및 비상 발전기 가동 지연에 따른 생산 차질 우려\n\n");

		sb.append("【필수 작성 지침】\n")
			.append(
				"1. [수치 포맷팅]: 제공된 팩트 데이터의 수치를 기사에 적극적으로 인용하되, 모든 비율(%) 수치는 반드시 **소수점 첫째 자리**까지만 작성하세요 (예: 1468.22% -> 1468.2%, 250% -> 250.0%).\n")
			.append(
				"2. [호가 가독성]: 매수/매도 잔량 등 크기가 큰 원시 숫자(예: 552601583)는 '약 5억 5천만', '약 9천 3백' 등으로 독자가 읽기 편하게 한글 단위로 변환하여 작성하세요.\n")
			.append("3. [전체 시황]: 본문 첫 문단에는 평균등락률, ADR, 대금증감률 수치를 인용하여 시장 전체의 투심과 유동성 흐름을 객관적으로 서술하세요.\n")
			.append(
				"4. [특징주 시나리오 반영]: 특징주가 있다면, 해당 종목의 등락률과 대금증감률, 잔량 수치를 명시하고, 등락률 부호(+/-)에 맞춰 위 시나리오 리스트 중 하나를 골라 주가 변동의 원인으로 자연스럽게 결합하세요.\n")
			.append("5. 절대 외부의 날씨(폭우 등)나 제공되지 않은 정보를 지어내지 마세요.\n\n");

		sb.append("【출력 포맷 및 예시 (JSON)】\n")
			.append("반드시 아래 JSON 구조로만 반환하세요:\n")
			.append("{\n")
			.append("  \"shortSummary\": \"스마트팜 STO 평균 1.5% 상승... 지리산 꾸지뽕 1호 AI 알고리즘 도입에 수급 집중\",\n")
			.append(
				"  \"textBody\": \"금일 스마트팜 STO 시장은 평균 등락률 +1.5%를 기록하며 전반적인 강세 흐름을 연출했습니다. 상승 종목이 우위를 점하며 등락비율(ADR)은 135.0%로 단기 과열권 진입 양상이 관찰됩니다. 반면 최근 3시간의 전체 거래대금은 직전 대비 20.5% 감소하며 유동성이 다소 위축되는 엇갈린 흐름을 보였습니다. 개별 특징주로는 지리산 꾸지뽕 1호가 거래대금이 120.0% 폭증하며 +8.5%의 강한 상승세를 보였습니다. 매도 잔량은 0인 반면 약 5억 5천만 규모의 매수 대기 물량이 쌓이는 극단적인 매수 쏠림이 나타났습니다. 이는 최신 AI 양액 제어 알고리즘 도입으로 생산량 30% 증대 성공 소식이 전해지며 투자 심리를 강하게 자극한 것으로 풀이됩니다.\"\n")
			.append("}");

		return sb.toString();
	}
}