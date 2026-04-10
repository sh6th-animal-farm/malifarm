package com.animalfarm.backend.global;

import java.math.BigDecimal;

import org.apache.commons.codec.digest.DigestUtils;

public class HashManager {

	public static String createHash(String prevHash, Long projectId, BigDecimal amount) {
		long nonce = System.currentTimeMillis();
		String rawData = prevHash + "|" + projectId + "|" + amount.toPlainString() + "|" + nonce;
		return DigestUtils.sha256Hex(rawData);
	}

	public static String resolveHash(String hash) {
		return null;
	}
}
