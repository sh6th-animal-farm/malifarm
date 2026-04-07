import { useEffect, useState, useCallback, useMemo } from 'react';
import { tokenApi } from '@/api/tokenApi';
import WebSocketManager from '@/utils/WebSocketManager';
import type { Token } from '@/types/tokenType';

// 정렬 기준 (거래대금 | 등락률 | 시장가)
export type SortType = 'VOLUME' | 'CHANGE' | 'PRICE';

export const useTokenList = (sortType: SortType = 'VOLUME', limit?: number) => {
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 실시간 데이터 업데이트 로직
  const updateTokenList = useCallback((updatedToken: Token) => {
    setTokenList((prevList) => {
      // prevList가 없거나 배열이 아닐 경우, 빈 배열로 초기화
      const safePrevList = Array.isArray(prevList) ? prevList : [];

      const index = safePrevList.findIndex(
        (t) => t.tokenId === updatedToken.tokenId,
      );

      let newList = [...safePrevList];

      if (index !== -1) {
        // 변경된 값만 덮어쓰기
        newList[index] = { ...newList[index], ...updatedToken };
      } else {
        // 새 요소 추가
        newList.push(updatedToken);
      }

      return newList;
    });
  }, []);

  // 2. 정렬 및 자르기 로직 (useMemo)
  const sortedTokens = useMemo(() => {
    // tokenList가 배열이 아니면 빈 배열로 초기화
    const safeList = Array.isArray(tokenList) ? tokenList : [];

    const sorted = [...safeList].sort((a, b) => {
      switch (sortType) {
        // 등락률 (내림차순)
        case 'CHANGE':
          return (b.changeRate || 0) - (a.changeRate || 0);
        // 현재가 (내림차순)
        case 'PRICE':
          return (b.marketPrice || 0) - (a.marketPrice || 0);
        // 거래대금 (내림차순)
        case 'VOLUME':
        default:
          const volA = parseFloat(String(a.dailyTradeVolume || 0));
          const volB = parseFloat(String(b.dailyTradeVolume || 0));
          return volB - volA;
      }
    });

    return limit ? sorted.slice(0, limit) : sorted;
  }, [tokenList, sortType, limit]); // 세 값이 변할 때만 재정렬

  // 초기 목록 데이터 로드
  useEffect(() => {
    const fetchAllToken = async () => {
      try {
        setIsLoading(true);
        const data = await tokenApi.getTokenList();
        setTokenList(data);
      } catch (e) {
        console.error('토큰 목록 로드 실패', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllToken();
  }, []);

  // 웹소켓 구독
  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL;
    const topic = '/topic/tokenList';
    const subId = 'tokenlist';

    WebSocketManager.connect(url, () => {
      WebSocketManager.subscribe(subId, topic, (data: Token) => {
        console.log('[WebSocket - 목록]', data);
        updateTokenList(data);
      });
    });

    return () => {
      WebSocketManager.unsubscribe(subId);
    };
  }, [updateTokenList]);

  return { tokenList: sortedTokens, isLoading };
};
