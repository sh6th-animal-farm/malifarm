import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import TabMenu from '@/components/common/TabMenu';
import Icon from '@/components/icon';
import { myPageApi } from '@/api/myPageApi';
import PageHeader from '@/pages/mypage/components/PageHeader';
import Investment from './Investment';
import TokenTable from './TokenTable';
import Account from './Account';
import Modal from '@/components/common/Modal.tsx';
import CreateAcc from './CreateAcc';
import { useWalletInfo } from '../../hooks/useWalletInfo';

export default function WalletLayout() {
  const [tab, setTab] = useState('HOLDINGS');
  const [isLinking, setIsLinking] = useState(false); // 계좌 연동 여부
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // 계좌 생성 여부 모달
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false); // 계좌 생성 에러 모달
  const [isCreatingAcc, setIsCreatingAcc] = useState<boolean>(false); // 계좌 생성 프로세스 모달
  const [currentStep, setCurrentStep] = useState(1); // 계좌 생성 진행 단계

  // 1. 초기 지갑 존재 여부만 체크하기 위한 상태 (훅 호출 결정용)
  const [initialWalletId, setInitialWalletId] = useState<number | undefined>(
    undefined,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 2. 실시간 훅 사용
  const {
    walletInfo,
    holdings,
    loading: walletLoading,
  } = useWalletInfo(initialWalletId);

  // 지갑 ID 가져와서 useWallet 훅 활성화
  const checkWalletExists = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const wallet = await myPageApi.getWalletInfo();
      if (wallet && wallet.walletId) {
        setInitialWalletId(Number(wallet.walletId));
      }
    } catch (error) {
      console.error('지갑 조회 실패', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    checkWalletExists();
  }, []);

  // 계좌 연동
  const handleLinkAccount = async () => {
    try {
      setIsLinking(true);
      await myPageApi.linkAccount();
      await checkWalletExists(); // 연동 성공 시 지갑 ID 세팅하여 useWallet 활성화
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            error?: { code?: string };
            message?: string;
          };
        };
      };

      if (apiError.response?.data) {
        const errorRes = apiError.response.data; // ApiResponseDTO

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
      setIsLinking(false);
    }
  };

  // 계좌 생성 후 연동
  const handleCreateLinkAccount = async () => {
    try {
      // 1. 확인 모달 닫고 로딩/진행 모달 열기
      setIsModalOpen(false);
      setIsCreatingAcc(true);
      setCurrentStep(1);

      // 2. 실제 API 호출 (연동 시작)
      await myPageApi.createAndLinkAccount();
      await checkWalletExists(); // 연동 성공 시 지갑 ID 세팅하여 useWallet 활성화
    } catch (error: any) {
      // 3. 에러 발생 시 에러 모달 열기
      setIsErrorModalOpen(true);
      setIsCreatingAcc(false); // 진행 모달 닫기
      setCurrentStep(1);
      console.error('계좌 연동 실패:', error);
    }
  };

  // 계좌 생성 프로세스 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCreatingAcc && currentStep < 4) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 2000); // 2초마다 다음 단계로
    }

    return () => clearTimeout(timer); // 언마운트 시 타이머 정리
  }, [isCreatingAcc, currentStep]);

  return (
    <div>
      <PageHeader
        title="나의 전자지갑"
        subtitle="연동된 증권 계좌와 실시간 투자 현황을 확인하세요."
        rightSlot={
          !isInitialLoading &&
          !initialWalletId && (
            <Button
              variant="default"
              width={138}
              height={44}
              onClick={handleLinkAccount}
              disabled={isLinking}
            >
              <span className="inline-flex items-center gap-1">
                <Icon name="link" size={14} color="white" />
                {isLinking ? '연동 중...' : '계좌 연동'}
              </span>
            </Button>
          )
        }
      />
      <Account
        walletInfo={walletInfo}
        loading={isInitialLoading || walletLoading}
      />
      {walletInfo && <Investment walletInfo={walletInfo} />}
      <TabMenu
        className="mb-4"
        items={[{ text: '보유 토큰', value: 'HOLDINGS' }]}
        currentValue={tab}
        onTabChange={setTab}
      />
      <TokenTable loading={false} holdings={holdings} />
      {/* 
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
      ) : null} */}

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
              checkWalletExists(); // 생성 완료 후 지갑 로드
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
