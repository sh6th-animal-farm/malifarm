package com.animalfarm.backend.domain.carbon;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test/snapshot")
public class CarbonSnapshotTestController {

	@Autowired
	private CarbonSnapshotBatchService CarbonBatchService;

	/**
	 * 스냅샷 강제 실행 테스트
	 */
	@PostMapping("/test/snapshot/user-token")
	public String testSnapshot(
		@RequestParam Long snapshotId,
		@RequestParam Long userId,
		@RequestParam Long tokenId
	) {
		CarbonBatchService.createSnapshotForUserAndToken(snapshotId, userId, tokenId);
		return "OK";
	}
}