package com.animalfarm.backend.domain.carbon;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.animalfarm.backend.domain.carbon.dto.CarbonDetailDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonListDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonSnapshotBalanceDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonSnapshotEventDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonUserWalletDTO;

@Mapper
public interface CarbonRepository {

	// [전체] 보유 토큰 기반 상품 리스트
	List<CarbonListDTO> selectAll(@Param("tokenIds")
	List<Long> tokenIds);

	// [카테고리] 카테고리 + 보유 토큰 기반 상품 리스트
	List<CarbonListDTO> selectByCondition(@Param("category")
	String category, @Param("tokenIds")
	List<Long> tokenIds);

	// 상세 조회
	CarbonDetailDTO selectDetail(Long cpId);

	// 유저 ID로 지갑 번호(ucl_id) 가져오기
	Long getWalletIdByUserId(@Param("userId")
	Long userId);

	//지분이 있는 토큰 ID 리스트를 받아 필터링된 상품들을 가져옵
	List<CarbonDetailDTO> selectProductsByTokenIds(@Param("tokenIds")
	List<Long> tokenIds);

	// 프로젝트 ID로 강황증권의 토큰 ID 조회
	Long getTokenIdByProjectId(@Param("projectId")
	Long projectId);

	/*// 프로젝트 ID로 총 투자금액(actual_amount)만 따로 가져오는 메서드
	BigDecimal getActualAmount(@Param("projectId")
	Long projectId);*/

	// 기존 BigDecimal getActualAmount(@Param("projectId") Long projectId); 수정
	BigDecimal getTotalSupply(@Param("projectId")
	Long projectId);

	//할인율
	BigDecimal getDiscountRate(@Param("sharePercent")
	BigDecimal sharePercent);

	String selectCpTitle(@Param("cpId")
	Long cpId);

	// 상품 잔여 수량 조회
	BigDecimal selectCpAmount(@Param("cpId")
	Long cpId);

	// 결제 완료시 carbonHist테이블에 거래내역 담기
	int insertCarbonHist(
		@Param("userId")
		Long userId,
		@Param("cpId")
		Long cpId,
		@Param("amount")
		BigDecimal amount,
		@Param("discountedPrice")
		BigDecimal discountedPrice,
		@Param("discountRate")
		BigDecimal discountRate);

	CarbonSnapshotEventDTO selectSnapshotEventBySeasonYm(@Param("seasonYm")
	String seasonYm);

	int insertSnapshotEvent(CarbonSnapshotEventDTO event);

	List<CarbonSnapshotEventDTO> selectDuePlannedSnapshotEvents();

	int markSnapshotEventCompleted(@Param("snapshotId")
	Long snapshotId);

	int markSnapshotEventFailed(@Param("snapshotId")
	Long snapshotId);

	Long selectLatestCompletedSnapshotId();

	BigDecimal selectSnapshotSharePercent(@Param("snapshotId")
	Long snapshotId, @Param("userId")
	Long userId, @Param("tokenId")
	Long tokenId);

	List<CarbonUserWalletDTO> selectAllUserWallets();

	BigDecimal getTotalSupplyByTokenId(@Param("tokenId")
	Long tokenId);

	int insertSnapshotBalances(@Param("list")
	List<CarbonSnapshotBalanceDTO> list);
}
