import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { projectApi, type DividendPollData } from '@/api/projectApi';
import DividendPollAddressModal from './components/DividendPollAddressModal';
import Toast from '@/components/common/Toast';

type DividendType = 'CASH' | 'CROP';

type PostcodeAddressData = {
  userSelectedType: 'R' | 'J';
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: 'Y' | 'N';
};

function formatPollEndDate(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function DividendPollRoutePage() {
  const navigate = useNavigate();
  const { id: pathId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<DividendType>('CASH');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [pollData, setPollData] = useState<DividendPollData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const handleCloseToast = useCallback(() => {
    setToastMsg(null);
  }, []);

  const dividendId = searchParams.get('id') ?? pathId ?? '';

  const fullAddress = useMemo(
    () => [address, detailAddress].filter(Boolean).join(' ').trim(),
    [address, detailAddress],
  );

  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-daum-postcode="true"]',
    );

    if (existingScript) return;

    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.dataset.daumPostcode = 'true';
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!dividendId) {
      setErrorMsg('배당 식별값이 없어 페이지를 열 수 없습니다.');
      setIsLoading(false);
      return;
    }

    const fetchPollData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);

        const response = await projectApi.getDividendPollData(dividendId);
        const nextPollData = response.dividend;

        setPollData(nextPollData);
        setSelectedType(nextPollData.dividendType === 'CROP' ? 'CROP' : 'CASH');
      } catch (error) {
        console.error('배당 설문 데이터 조회 실패:', error);
        setErrorMsg(
          '배당 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPollData();
  }, [dividendId]);

  const handleAddressSearch = () => {
    const daumPostcode = (
      window as Window & {
        daum?: {
          Postcode: new (options: {
            oncomplete: (data: PostcodeAddressData) => void;
          }) => { open: () => void };
        };
      }
    ).daum?.Postcode;

    if (!daumPostcode) {
      setToastMsg(
        '주소 검색 기능이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.',
      );
      return;
    }

    new daumPostcode({
      oncomplete: (data: PostcodeAddressData) => {
        let selectedAddress =
          data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        let extraAddress = '';

        if (data.bname && /[동로가]$/g.test(data.bname)) {
          extraAddress += data.bname;
        }

        if (data.buildingName && data.apartment === 'Y') {
          extraAddress += extraAddress
            ? `, ${data.buildingName}`
            : data.buildingName;
        }

        if (extraAddress) {
          selectedAddress += ` (${extraAddress})`;
        }

        setAddress(selectedAddress);
      },
    }).open();
  };

  const submitSelection = async (type: DividendType) => {
    if (!pollData) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      const redirectTo = `/project/dividend/poll?id=${pollData.dividendId}`;
      setToastMsg('수령 방식 선택을 완료하려면 로그인이 필요합니다.');
      navigate(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await projectApi.selectDividendPoll({
        dividendId: pollData.dividendId,
        dividendType: type,
        ...(type === 'CROP' ? { address: fullAddress } : {}),
      });
      const message = '수령 방식 선택이 완료되었습니다.';

      setToastMsg(message || '수령 방식 선택이 완료되었습니다.');
      setIsAddressModalOpen(false);
      navigate('/mypage/transaction-history');
    } catch (error: any) {
      console.error('배당 수령 방식 저장 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (selectedType === 'CROP') {
      setIsAddressModalOpen(true);
      return;
    }

    void submitSelection('CASH');
  };

  const handleConfirmCrop = () => {
    if (!fullAddress) {
      setToastMsg('배송지를 먼저 입력해 주세요.');
      return;
    }

    void submitSelection('CROP');
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="layout-container">
          <div className="mx-auto max-w-[560px] rounded-[28px] border border-gray-100 bg-white px-6 py-16 text-center shadow-[var(--shadow-weak)]">
            <p className="font-body-02 text-gray-600">
              배당 정보를 불러오는 중입니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (errorMsg || !pollData) {
    return (
      <section className="py-16">
        <div className="layout-container">
          <div className="mx-auto max-w-[560px] rounded-[28px] border border-red-100 bg-white px-6 py-16 text-center shadow-[var(--shadow-weak)]">
            <p className="font-body-02 text-red-500">
              {errorMsg || '배당 정보를 찾을 수 없습니다.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-10 md:py-16">
        <div className="layout-container">
          <div className="mx-auto max-w-[560px]">
            <div className="mb-6">
              <p className="font-caption-03 uppercase tracking-[0.08em]">
                Dividend Poll
              </p>
              <h1 className="mt-2 font-header-01 text-gray-900">
                배당 수령 방식을 선택해 주세요
              </h1>
              <p className="mt-3 font-body-01 text-gray-600">
                배당금은 현금으로 받을 수도 있고, 프로젝트와 연결된 농산물로
                받을 수도 있습니다. 마감 전까지 원하는 수령 방식을 선택해
                주세요.
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white bg-white shadow-2xl">
              <div className="border-b border-white px-6 py-7 md:px-8">
                <p className="font-caption-02 text-green-800">
                  예상 배당금(세후)
                </p>
                <p className="mt-3 font-header-00 text-green-700">
                  {Number(pollData.amountAftTax || 0).toLocaleString()}원
                </p>
              </div>

              <div className="px-6 py-7 md:px-8">
                <p className="mb-3 font-button-02 text-gray-700">
                  수령하실 방식을 선택해 주세요
                </p>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedType('CASH')}
                    className={`group relative w-full overflow-hidden rounded-[20px] border p-5 text-left transition-all ${
                      selectedType === 'CASH'
                        ? 'border-green-600 bg-green-0 shadow-[0_14px_32px_rgba(108,195,45,0.12)]'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-0/40'
                    }`}
                  >
                    <span className="absolute right-[-18px] bottom-[-34px] text-[112px] font-black leading-none text-gray-100">
                      ₩
                    </span>
                    <div className="relative z-10 pr-16">
                      <p className="font-body-04 text-gray-900">
                        현금으로 받기
                      </p>
                      <p className="mt-1 font-caption-01 text-gray-500">
                        등록된 계좌로 배당금이 입금됩니다.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('CROP')}
                    className={`group relative w-full overflow-hidden rounded-[20px] border p-5 text-left transition-all ${
                      selectedType === 'CROP'
                        ? 'border-green-600 bg-green-0 shadow-[0_14px_32px_rgba(108,195,45,0.12)]'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-0/40'
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="absolute right-[-18px] bottom-[-18px] h-[112px] w-[112px] -rotate-12 fill-gray-100"
                      aria-hidden="true"
                    >
                      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" />
                    </svg>
                    <div className="relative z-10 pr-16">
                      <p className="font-body-04 text-gray-900">
                        농산물로 받기
                      </p>
                      <p className="mt-1 font-caption-01 text-gray-500">
                        제철 수확물을 기준으로 우선 배송해 드립니다.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-6 rounded-[16px] border-l-4 border-warning bg-warning-light px-4 py-3">
                  <p className="font-caption-02 text-gray-700">
                    마감기한:{' '}
                    <strong className="font-body-03 text-gray-900">
                      {formatPollEndDate(pollData.pollEndDate)}
                    </strong>
                  </p>
                  <p className="mt-1 font-caption-01 text-gray-600">
                    기한 내 미선택 시 기본 수령 방식인 현금으로 자동 확정됩니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="mt-6 w-full rounded-[16px] bg-green-600 px-4 py-4 font-button-01 text-white transition-colors hover:bg-green-700 disabled:bg-gray-300"
                >
                  {isSubmitting ? '처리 중...' : '선택 완료'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DividendPollAddressModal
        isOpen={isAddressModalOpen}
        address={address}
        detailAddress={detailAddress}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSearch={handleAddressSearch}
        onDetailAddressChange={setDetailAddress}
        onConfirm={handleConfirmCrop}
      />
      {toastMsg && <Toast message={toastMsg} onClose={handleCloseToast} />}
    </>
  );
}
