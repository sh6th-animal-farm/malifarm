import { useState, useEffect } from 'react';
import { projectApi } from '@/api/projectApi';
import type { Wallet } from '@/types/projectType';

export const useWallet = (userId: string | number | undefined) => {
  const [walletData, setWalletData] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const response = await projectApi.getMyWalletInfo(userId);

        // 보통 axios는 response.data에 실제 값이 들어있습니다.
        setWalletData(response);
      } catch (err) {
        console.error('지갑 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [userId]); // userId가 들어올 때 실행됨

  return { walletData, isLoading };
};
