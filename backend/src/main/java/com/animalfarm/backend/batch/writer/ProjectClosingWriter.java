package com.animalfarm.backend.batch.writer;

import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import com.animalfarm.backend.domain.accounting.dto.RefundTokenLedgerDTO;
import com.animalfarm.backend.domain.refund.RefundRepository;
import com.animalfarm.backend.domain.subscription.SubscriptionRepository;
import com.animalfarm.backend.domain.token.TokenRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProjectClosingWriter implements ItemWriter<RefundTokenLedgerDTO> {
	private final RefundRepository refundRepository;
	private final TokenRepository tokenRepository;
	private final SubscriptionRepository subscriptionRepository;

	@Override
	// 2. 파라미터 타입을 List<? extends T>에서 Chunk<? extends T>로 변경
	public void write(Chunk<? extends RefundTokenLedgerDTO> items) throws Exception {
		for (RefundTokenLedgerDTO item : items) {
			// 환불 정보 저장
			refundRepository.insertRefund(item.getRefundDTO());
			subscriptionRepository.restoreLimit(
				item.getRefundDTO().getUserId(),
				item.getRefundDTO().getAmount()
			);

			// 토큰 원장 저장
			tokenRepository.insertTokenLedger(item.getTokenLedgerDTO());

			// 기존 토큰 소유자 잔고 없애기
			tokenRepository.updateTokenBalance(
				item.getTokenLedgerDTO().getFromUserId(),
				item.getTokenLedgerDTO().getTokenId(),
				item.getTokenLedgerDTO().getFrom_balanceAfter()
			);
		}
	}
}