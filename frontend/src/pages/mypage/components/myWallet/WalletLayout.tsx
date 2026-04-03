import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import LoadMoreButton from '@/components/common/LoadMoreButton';
import TabMenu from '@/components/common/TabMenu';
import Icon from '@/components/icon';
import { myPageApi } from '@/api/myPageApi';
import PageHeader from '@/pages/mypage/components/PageHeader';
import type { HoldingDTO, WalletInfoDTO } from '@/types/myPageType';
import Investment from './Investment';
import TokenTable from './TokenTable';
import Account from './Account';
import Modal from '@/components/common/Modal.tsx';
import CreateAcc from './CreateAcc';

export default function WalletLayout() {
  const [tab, setTab] = useState('HOLDINGS');
  const [loading, setLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [holdingsLoadingMore, setHoldingsLoadingMore] = useState(false);
  const [holdingsPage, setHoldingsPage] = useState(1);
  const [holdingsHasNext, setHoldingsHasNext] = useState(false);
  const [nextHoldings, setNextHoldings] = useState<HoldingDTO[] | null>(null);
  const [linking, setLinking] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfoDTO | null>(null);
  const [holdings, setHoldings] = useState<HoldingDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // 계좌 생성 여부 모달
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false); // 계좌 생성 에러 모달
  const [isCreatingAcc, setIsCreatingAcc] = useState<boolean>(false); // 계좌 생성 프로세스 모달
  const [currentStep, setCurrentStep] = useState(1); // 계좌 생성 진행 단계

  // 계좌 생성 프로세스 시작 시 타이머 작동
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCreatingAcc && currentStep < 4) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 2000); // 2초마다 다음 단계로
    }

    return () => clearTimeout(timer); // 언마운트 시 타이머 정리
  }, [isCreatingAcc, currentStep]);

  const fetchWalletData = useCallback(async () => {
    try {
      const wallet = await myPageApi.getWalletInfo();
      setWalletInfo(wallet);
    } catch (error) {
      console.error('지갑 정보 로드 실패', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHoldings = useCallback(async () => {
    try {
      setHoldingsLoading(true);
      setHoldingsPage(1);
      const [holdingList, nextPageList] = await Promise.all([
        myPageApi.getHoldings(1),
        myPageApi.getHoldings(2),
      ]);
      const firstPageItems = holdingList ?? [];
      const prefetchedItems = nextPageList ?? [];
      setHoldings(firstPageItems);
      setNextHoldings(prefetchedItems);
      setHoldingsHasNext(prefetchedItems.length > 0);
    } catch (error) {
      console.error('보유 토큰 로드 실패', error);
      setHoldings([]);
      setNextHoldings([]);
      setHoldingsHasNext(false);
    } finally {
      setHoldingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
    fetchHoldings();
  }, [fetchWalletData, fetchHoldings]);

  const handleLinkAccount = async () => {
    try {
      setLinking(true);
      await myPageApi.linkAccount();
      await Promise.all([fetchWalletData(), fetchHoldings()]);
    } catch (error) {
      if (error.response && error.response.data) {
        const errorRes = error.response.data; // ApiResponseDTO

        console.log('서버 에러 코드:', errorRes.error?.code);
        console.log('서버 메시지:', errorRes.message);

        if (errorRes.error?.code === 'EXTERNAL_005') {
          // 연동 가능한 계좌 없음
          setIsModalOpen(true);
        }
      } else {
        console.error('계좌 연동 실패', error);
      }
    } finally {
      setLinking(false);
    }
  };

  const handleLoadMoreHoldings = async () => {
    if (holdingsLoading || holdingsLoadingMore || !holdingsHasNext) return;
    const nextPage = holdingsPage + 1;
    try {
      setHoldingsLoadingMore(true);
      const appendItems = nextHoldings ?? [];
      if (appendItems.length === 0) {
        setHoldingsHasNext(false);
        return;
      }
      setHoldings((prev) => [...prev, ...appendItems]);
      setHoldingsPage(nextPage);
      const prefetchedFollowing = await myPageApi.getHoldings(nextPage + 1);
      const followingItems = prefetchedFollowing ?? [];
      setNextHoldings(followingItems);
      setHoldingsHasNext(followingItems.length > 0);
    } catch (error) {
      console.error('보유 토큰 추가 로드 실패', error);
    } finally {
      setHoldingsLoadingMore(false);
    }
  };

  const handleCreateLinkAccount = async () => {
    try {
      // 1. 확인 모달 닫고 로딩/진행 모달 열기
      setIsModalOpen(false);
      setIsCreatingAcc(true);
      setCurrentStep(1);

      // 2. 실제 API 호출 (연동 시작)
      await myPageApi.createAndLinkAccount();
      console.log('계좌 연동 성공');
    } catch (error: any) {
      // 3. 에러 발생 시 에러 모달 열기
      setIsErrorModalOpen(true);
      setIsCreatingAcc(false); // 진행 모달 닫기
      setCurrentStep(1);
      console.error('계좌 연동 실패:', error);
    }
  };

  return (
    <div>
      <PageHeader
        title="나의 전자지갑"
        subtitle="연동된 증권 계좌와 실시간 투자 현황을 확인하세요."
        rightSlot={
          !walletInfo && (
            <Button
              variant="default"
              width={138}
              height={44}
              onClick={handleLinkAccount}
              disabled={linking}
            >
              <span className="inline-flex items-center gap-1">
                <Icon name="link" size={14} color="white" />
                {linking ? '연동 중...' : '계좌 연동'}
              </span>
            </Button>
          )
        }
      />
      <Account walletInfo={walletInfo} loading={loading} />
      <Investment walletInfo={walletInfo} />
      <TabMenu
        className="mb-4"
        items={[{ text: '보유 토큰', value: 'HOLDINGS' }]}
        currentValue={tab}
        onTabChange={setTab}
      />
      <TokenTable loading={holdingsLoading} holdings={holdings} />
      {!holdingsLoading && holdings.length > 0 && holdingsHasNext ? (
        <div className="mt-6">
          <LoadMoreButton
            onClick={handleLoadMoreHoldings}
            disabled={holdingsLoadingMore}
          >
            {holdingsLoadingMore ? '불러오는 중...' : '+ 더보기'}
          </LoadMoreButton>
        </div>
      ) : null}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Modal
            variant={'warning'}
            title={'연동 가능한 계좌가 없습니다.'}
            message={'계좌 생성 페이지로 이동하시겠습니까?'}
            leftText={'확인'}
            rightText={'취소'}
            onConfirm={handleCreateLinkAccount}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      )}

      {isCreatingAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <CreateAcc
            step={currentStep}
            onClose={() => {
              setIsCreatingAcc(false); // 모달 닫기
              setCurrentStep(1);
              fetchWalletData(); // 계좌 정보 새로고침
            }}
          />
        </div>
      )}

      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Modal
            variant={'warning'}
            title={'계좌 연동 실패'}
            message={'계좌 연동에 실패했습니다. 다시 시도해주세요.'}
            text={'확인'}
            onConfirm={() => setIsErrorModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
