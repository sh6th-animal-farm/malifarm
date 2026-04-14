package com.animalfarm.backend.domain.carbon;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.animalfarm.backend.domain.carbon.dto.CarbonDetailDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonListDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonSnapshotBalanceDTO;
import com.animalfarm.backend.domain.carbon.dto.CarbonSnapshotEventDTO;

@Mapper
public interface CarbonRepository {

	// 전체 리스트 (스냅샷 보유 토큰 기준)
	List<CarbonListDTO> selectAll(@Param("tokenIds") List<Long> tokenIds);

	// 카테고리 리스트 (스냅샷 보유 토큰 기준)
	List<CarbonListDTO> selectByCondition(@Param("category") String category, @Param("tokenIds") List<Long> tokenIds);

	// 상세 조회
	CarbonDetailDTO selectDetail(Long cpId);

	// 현재 유저 지갑 ID 조회
	Long getWalletIdByUserId(@Param("userId") Long userId);

	// 프로젝트 ID -> 토큰 ID
	Long getTokenIdByProjectId(@Param("projectId") Long projectId);

	// 프로젝트별 토큰 총발행량
	BigDecimal getTotalSupply(@Param("projectId") Long projectId);

	// 토큰 ID 기준 총발행량
	BigDecimal getTotalSupplyByTokenId(@Param("tokenId") Long tokenId);

	// 지분율 구간별 할인율 조회
	BigDecimal getDiscountRate(@Param("sharePercent") BigDecimal sharePercent);

	// 상품명
	String selectCpTitle(@Param("cpId") Long cpId);

	// 상품 잔여 수량
	BigDecimal selectCpAmount(@Param("cpId") Long cpId);

	// 구매내역 저장
	int insertCarbonHist(
		@Param("userId") Long userId,
		@Param("cpId") Long cpId,
		@Param("amount") BigDecimal amount,
		@Param("discountedPrice") BigDecimal discountedPrice,
		@Param("discountRate") BigDecimal discountRate);

	// 최신 완료 스냅샷 ID
	Long selectLatestCompletedSnapshotId();

	// 스냅샷 기준 보유 정보 조회
	CarbonSnapshotBalanceDTO selectSnapshotBalance(
		@Param("snapshotId") Long snapshotId,
		@Param("userId") Long userId,
		@Param("tokenId") Long tokenId);

	// 스냅샷 기준 유저가 보유한 토큰 목록
	List<Long> selectSnapshotTokenIdsByUserId(
		@Param("snapshotId") Long snapshotId,
		@Param("userId") Long userId);

	// 배치: 예정된 스냅샷 이벤트 1건 조회
	CarbonSnapshotEventDTO selectPlannedSnapshotEvent(@Param("now") LocalDateTime now);

	// 배치: 스냅샷 이벤트 상태 변경
	int updateSnapshotEventStatus(
		@Param("snapshotId") Long snapshotId,
		@Param("status") String status,
		@Param("snapshotAt") LocalDateTime snapshotAt
	);

	// 배치: 기업 회원 목록 조회
	List<Long> selectEnterpriseUserIds();

	// 배치: 스냅샷 balance 저장
	int insertSnapshotBalance(
		@Param("snapshotId") Long snapshotId,
		@Param("userId") Long userId,
		@Param("walletId") Long walletId,
		@Param("tokenId") Long tokenId,
		@Param("tokenBalance") BigDecimal tokenBalance,
		@Param("totalSupply") BigDecimal totalSupply,
		@Param("sharePercent") BigDecimal sharePercent
	);
}