package com.animalfarm.backend.domain.token;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.animalfarm.backend.domain.project.dto.TokenLedgerDTO;
import com.animalfarm.backend.domain.token.dto.TokenDTO;
import com.animalfarm.backend.domain.token.dto.TokenIssueDTO;

@Mapper
public interface TokenRepository {

	TokenDTO selectByProjectId(Long projectId);

	TokenIssueDTO selectIssueToken(Long projectId);

	void updateTokenStatus(Long tokenId, String status);

	Long selectWalletId(Long userId);

	public abstract void insertTokenLedger(TokenLedgerDTO projectNewTokenDTO);

	void insertTokenLedgerBatch(List<TokenLedgerDTO> tokenLedgerList);

	String selectLastHash();

	void updateDeletedAt(Long tokenId);

	void updateTokenBalance(Long userId, Long tokenId, BigDecimal balanceAfter);
}
