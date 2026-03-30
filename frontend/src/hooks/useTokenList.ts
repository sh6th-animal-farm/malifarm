import { useEffect, useState, useCallback } from 'react';
import { tokenApi } from '@/api/tokenApi';
import WebSocketManager from '@/utils/WebSocketManager';
import type { Token } from '@/types/tokenType';

export const useTokenList = () => {
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 거래대금 기준 내림차순 정렬 함수
  const sortByTradeVolume = (list: Token[]) => {
    return [...list].sort((a, b) => {
      const volA = parseFloat(String(a.dailyTradeVolume || 0));
      const volB = parseFloat(String(b.dailyTradeVolume || 0));
      return volB - volA;
    });
  };

  // 실시간 업데이트 로직
  const updateTokenList = useCallback((updatedToken: Token) => {
    setTokenList((prevList) => {
      const index = prevList.findIndex((t) => t.tokenId === updatedToken.tokenId);
      let newList = [...prevList];

      if (index !== -1) {
        // 변경된 값만 덮어쓰기
        newList[index] = { ...newList[index], ...updatedToken };
      } else {
        // 새 요소 추가
        newList.push(updatedToken);
      }

      return sortByTradeVolume(newList); // 값이 변경될 때마다 재정렬
    });
  }, []);

  // 초기 목록 데이터 로드
  useEffect(() => {
    const fetchAllToken = async () => {
      try {
        setIsLoading(true);
        const data = await tokenApi.getTokenList();
        setTokenList(sortByTradeVolume(data)); // 초기 데이터 로드 시에도 거래대금 정렬 적용
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
    const subId = 'main-tokenlist';

    WebSocketManager.connect(url, () => {
      WebSocketManager.subscribe(subId, topic, (data: Token) => {
        console.log('[WebSocket - 종목]', data);
        updateTokenList(data);
      });
    });

    return () => {
      WebSocketManager.unsubscribe(subId);
    };
  }, [updateTokenList]);

  return { tokenList, isLoading };
};