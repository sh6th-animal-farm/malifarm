package com.animalfarm.backend.domain.project;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;

import com.animalfarm.backend.domain.project.dto.FarmDTO;
import com.animalfarm.backend.domain.project.dto.FarmSensorDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;
import com.animalfarm.backend.global.http.ExternalApiClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FarmService {

	@Value("${api.kakao.rest.key}")
	private String kakaoApiKey;

	@Value("${smartfarm.api.key}")
	private String smartFarmApiKey;

	@Value("${smartfarm.api.base-url}")
	private String smartFarmBaseURL;

	private final FarmRepository farmRepository;
	private final ExternalApiClient externalApiClient;

	public List<FarmDTO> selectAllFarm() {
		return farmRepository.selectAllFarm();
	}

	public void registerFarm(FarmDTO farmDTO) {
		farmRepository.insertFarm(farmDTO);
	}

	public Map<String, Object> getCoordsFromAddress(String address) {
		String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + address;
		Map<String, String> customHeaders = new HashMap<>(); // 단순 Map 사용
		customHeaders.put("Authorization", "KakaoAK " + kakaoApiKey);
		System.out.println(kakaoApiKey);

		// 이제 제네릭 타입을 사용하여 안전하게 호출할 수 있습니다.
		ParameterizedTypeReference<ExternalApiResponseDTO<Map<String, Object>>> typeRef =
			new ParameterizedTypeReference<ExternalApiResponseDTO<Map<String, Object>>>() {
			};

		// API 응답에서 x(경도), y(위도) 추출 로직 (간략화)
		Map<String, Object> fullResponse = externalApiClient.callApi(url, HttpMethod.GET, null, typeRef, customHeaders);
		System.out.println(fullResponse);
		if (fullResponse != null && fullResponse.containsKey("documents")) {
			List<Map<String, Object>> documents = (List<Map<String, Object>>)fullResponse.get("documents");

			if (documents != null && !documents.isEmpty()) {
				Map<String, Object> firstDoc = documents.get(0);

				Map<String, Object> result = new HashMap<>();
				result.put("longitude", firstDoc.get("x")); // 경도
				result.put("latitude", firstDoc.get("y")); // 위도
				result.put("altitude", 0); // 고도는 카카오에서 제공 안 하므로 기본값 0

				return result;
			}
		}

		throw new RuntimeException("주소에 해당하는 좌표를 찾을 수 없습니다.");
	}

	public void saveCurrentHourEnv() {
		// 1. 현재 시간 및 1년 전 날짜 설정
		LocalDateTime now = LocalDateTime.now();
		String oneYearAgo = now.minusYears(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		String currentHour = now.format(DateTimeFormatter.ofPattern("HH:00"));

		Map<Long, String[]> farmMapping = new HashMap<>() {{
			put(3L, new String[] {"PF_0000320_01", "080400"});   // 딸기
			put(4L, new String[] {"PF_0022038_01", "061400"});   // 감귤
			put(23L, new String[] {"PF_0006001_01", "065900"});   // 블루베리
			put(12L, new String[] {"PF_0006027_01", "060300"});   // 포도
			put(11L, new String[] {"PF_0006017_01", "120500"});  // 고추(11)
			put(15L, new String[] {"PF_0006017_01", "120500"});  // 고추(15) - 같은 데이터 활용
			put(19L, new String[] {"PF_0024647_01", "132600"});  // 파프리카
			put(14L, new String[] {"PF_0025312_01", "080100"});   // 수박
			put(35L, new String[] {"PFS_0000001_01", "080300"}); // 토마토

			// 매칭 정보가 없는 ??? 농장들 (기본값 설정 - 토마토 데이터 활용 예시)
			long[] unknowns = {10L, 18L, 20L, 7L, 13L, 36L, 17L, 34L, 1L, 8L, 5L, 21L, 9L, 16L, 33L, 22L, 2L, 6L};
			for (long id : unknowns) {
				put(id, new String[] {"PFS_0000001_01", "080300"});
			}
		}};
		ParameterizedTypeReference<List<FarmSensorDTO>> typeRef = new ParameterizedTypeReference<>() {
		};

		for (Map.Entry<Long, String[]> entry : farmMapping.entrySet()) {
			Long myFarmId = entry.getKey();
			String apiFarmId = entry.getValue()[0];
			String itemCode = entry.getValue()[1];

			try {
				String tempUrl =
					smartFarmBaseURL + smartFarmApiKey + "/" + apiFarmId + "/" + oneYearAgo + "/FG/EI/TI/" + itemCode;
				String humiUrl =
					smartFarmBaseURL + smartFarmApiKey + "/" + apiFarmId + "/" + oneYearAgo + "/FG/EI/HI/" + itemCode;

				// API 호출
				List<FarmSensorDTO> tempData = externalApiClient.callRawApi(tempUrl, HttpMethod.GET, typeRef);
				List<FarmSensorDTO> humiData = externalApiClient.callRawApi(humiUrl, HttpMethod.GET, typeRef);

				// 현재 시간 데이터 필터링
				String tempValue = filterDataByHour(tempData, currentHour);
				String humiValue = filterDataByHour(humiData, currentHour);

				// DB 저장
				if (tempValue != null || humiValue != null) {
					Double tempValueNum = (tempValue != null) ? Double.parseDouble(tempValue) : null;
					Double humiValueNum = (humiValue != null) ? Double.parseDouble(humiValue) : null;

					farmRepository.insertFarmEnv(myFarmId, humiValueNum, tempValueNum);
					System.out.println(
						"[저장완료] 내농장:" + myFarmId + " (" + apiFarmId + ") -> 온:" + tempValue + ", 습:" + humiValue);
				}
				Thread.sleep(500);
			} catch (Exception e) {
				System.err.println("[오류발생] 농장ID " + myFarmId + ": " + e.getMessage());
			}
		}
	}

	// 리스트에서 특정 시간의 senVal만 뽑아내는 헬퍼 메서드
	private String filterDataByHour(List<FarmSensorDTO> list, String hour) {
		if (list == null)
			return null;
		return list.stream()
			.filter(d -> d.getMeasDate().contains(hour))
			.map(FarmSensorDTO::getSenVal)
			.findFirst()
			.orElse(null);
	}
}
