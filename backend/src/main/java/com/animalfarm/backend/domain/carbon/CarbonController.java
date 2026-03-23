package com.animalfarm.backend.domain.carbon;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animalfarm.backend.domain.carbon.dto.CarbonDetailDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonListDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonOrderCompleteDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonOrderResponseDTO;
import com.animalfarm.backend.global.dto.ExternalApiResponseDTO;

@RestController
@RequestMapping("/api/carbon")
public class CarbonController {

	@Autowired
	private CarbonService carbonService;

	/**
	 * [수정] 전체 조회
	 * ExternalApiResponseDTO로 감싸서 반환해야 JS의 result.payload 로직이 작동합니다.
	 */
	@GetMapping("/list")
	public ExternalApiResponseDTO<List<CarbonListDTO>> selectAll() {
		List<CarbonListDTO> list = carbonService.selectAll();
		return new ExternalApiResponseDTO<>("전체 상품 리스트 조회 성공", list);
	}

	/**
	 * [수정] 카테고리 조건 조회
	 * carbon_list.js의 fetch 요청과 응답 규격을 맞춥니다.
	 */
	@GetMapping("/category")
	public ExternalApiResponseDTO<List<CarbonListDTO>> selectByCategory(
		@RequestParam(value = "category", required = false, defaultValue = "ALL")
		String category) {

		List<CarbonListDTO> list = carbonService.selectByCondition(category);
		return new ExternalApiResponseDTO<>(category + " 카테고리 조회 성공", list);
	}

	// 상세 페이지 조회
	@GetMapping("/{cpId}")
	public ExternalApiResponseDTO<CarbonDetailDTO> selectDetail(@PathVariable
	Long cpId) {
		return carbonService.selectDetail(cpId);
	}

	@GetMapping("/orders/quote")
	public ExternalApiResponseDTO<CarbonOrderResponseDTO> quote(
		@RequestParam("cpId")
		Long cpId,
		@RequestParam("amount")
		BigDecimal amount) {
		return carbonService.quoteOrder(cpId, amount);
	}

	@PostMapping("/orders/complete")
	public ExternalApiResponseDTO<String> completeOrder(@RequestBody
	CarbonOrderCompleteDTO req) {
		carbonService.completeOrder(req); // 서비스에 구현
		return new ExternalApiResponseDTO<>("주문 완료 처리 성공", null);
	}
}
