package com.animalfarm.backend.domain.refund;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.animalfarm.backend.domain.subscription.SubscriptionRepository;

@Service
public class RefundService {
	@Autowired
	RefundRepository refundRepository;

	@Autowired
	SubscriptionRepository subscriptionRepository;

	public void insertRefunds(List<RefundDTO> refundList) {
		for (RefundDTO refund : refundList) {
			refundRepository.insertRefund(refund);
			subscriptionRepository.restoreLimit(refund.getUserId(), refund.getAmount());
		}
	}
}
