// src/pages/Carbon/components/CarbonOrderModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

declare global {
  interface Window {
    IMP: any;
  }
}

interface CarbonOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cpId: number;
  productName: string;
  unitPrice: number;
  maxQty: number;
}

export default function CarbonOrderModal({
  isOpen,
  onClose,
  cpId,
  productName,
  unitPrice,
  maxQty,
}: CarbonOrderModalProps) {
  const navigate = useNavigate();

  const [amount, setAmount] = useState<number | string>(1);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentQty = Number(amount) || 0;

  // 서버 API 데이터 상태
  const [quoteData, setQuoteData] = useState({
    maxQty: 0,
    unitPrice: 0,
    supplyAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
  });

  // 🌟 2. 즉각 렌더링: API가 느리거나 에러가 나도 화면이 0원이 되지 않게 즉시 계산!
  // 서버 값이 있으면 서버 값을, 없으면 부모가 준 기본값을 씁니다.
  const displayUnitPrice =
    quoteData.unitPrice > 0 ? quoteData.unitPrice : unitPrice;
  const displayMaxQty = quoteData.maxQty > 0 ? quoteData.maxQty : maxQty;
  const displayTotal =
    quoteData.totalAmount > 0
      ? quoteData.totalAmount
      : displayUnitPrice * currentQty;
  const displaySupply =
    quoteData.supplyAmount > 0
      ? quoteData.supplyAmount
      : Math.round(displayTotal / 1.1);
  const displayVat =
    quoteData.vatAmount > 0
      ? quoteData.vatAmount
      : displayTotal - displaySupply;

  useEffect(() => {
    if (!isOpen || !cpId) return;

    const fetchQuote = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const reqAmount = Number(amount) || 1;

        // 🌟 3. 주소 오류 방지: VITE_API_BASE_URL을 붙여서 엉뚱한 곳에 요청하지 않도록 수정!
        const baseURL = import.meta.env.VITE_API_BASE_URL || '';

        const res = await axios.get(`${baseURL}/api/carbon/orders/quote`, {
          params: { cpId, amount: reqAmount },
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });

        // 데이터 안전하게 꺼내기
        const p = res.data?.payload;
        if (p) {
          const userMax = Number(p.userMaxLimit || 0);
          const remain = Number(p.remainAmount || 0);
          const max = Math.max(
            0,
            Math.min(userMax || remain, remain || userMax),
          );

          setQuoteData({
            maxQty: max,
            unitPrice: Number(p.unitPrice || 0),
            supplyAmount: Number(p.supplyAmount || 0),
            vatAmount: Number(p.vatAmount || 0),
            totalAmount: Number(p.totalAmount || 0),
          });
        }
      } catch (error) {
        console.error('견적 정보를 불러오는데 실패했습니다.', error);
      }
    };

    fetchQuote();
  }, [isOpen, cpId, amount]);

  const handleClose = () => {
    setAmount(1);
    setIsAgreed(false);
    // 모달 닫을 때 이전 값 찌꺼기 청소
    setQuoteData({
      maxQty: 0,
      unitPrice: 0,
      supplyAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
    });
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleSubmitOrder = async () => {
    console.log('🔥 impCode:', import.meta.env.VITE_PORTONE_IMP_CODE);
    console.log('🔥 channelKey:', import.meta.env.VITE_PORTONE_CHANNEL_KEY);

    if (!window.IMP) {
      alert(
        '결제 모듈(PortOne)을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.',
      );
      return;
    }

    setIsSubmitting(true);

    const impCode = import.meta.env.VITE_PORTONE_IMP_CODE || '가맹점 식별코드';
    const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY || '채널 키';
    const merchantUid = `mlf_carbon_${cpId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const { IMP } = window;
    IMP.init(impCode);

    IMP.request_pay(
      {
        channelKey: channelKey,
        pay_method: 'card',
        merchant_uid: merchantUid,
        name: productName,
        amount: displayTotal, // 즉시 계산된 총액 전달
      },
      async (rsp: any) => {
        if (rsp.success) {
          try {
            const token = localStorage.getItem('accessToken');
            const baseURL = import.meta.env.VITE_API_BASE_URL || '';

            await axios.post(
              `${baseURL}/api/carbon/orders/complete`,
              {
                impUid: rsp.imp_uid,
                merchantUid: rsp.merchant_uid,
                cpId: cpId,
                amount: currentQty,
              },
              {
                headers: { Authorization: token ? `Bearer ${token}` : '' },
              },
            );

            alert('결제가 성공적으로 완료되었습니다!');
            handleClose();
            navigate('/mypage/carbon-history');
          } catch (error) {
            console.error(error);
            alert(
              '결제는 완료됐지만 서버 검증 처리에 실패했습니다. 관리자에게 문의하세요.',
            );
          } finally {
            setIsSubmitting(false);
          }
        } else {
          alert(`결제 실패: ${rsp.error_msg}`);
          setIsSubmitting(false);
        }
      },
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 overflow-y-auto flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <div className="fixed inset-0 bg-black/45" onClick={handleClose} />

      <div className="relative w-[440px] bg-white rounded-(--radius-lg) shadow-(--shadow-std) overflow-hidden font-main flex flex-col z-10 my-[40px]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[16px]">
          <h3 className="m-0 font-subtitle-01 text-(--color-gray-900)">
            주문 신청하기
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-[32px] h-[32px] border-none bg-transparent text-(--color-gray-500) text-[22px] cursor-pointer rounded-(--radius-s) hover:bg-(--color-gray-50) hover:text-(--color-gray-800)"
          >
            ×
          </button>
        </div>

        <div className="px-[24px] pb-[24px] flex flex-col gap-[16px]">
          {/* 상품 정보 영역 */}
          <div className="flex items-center gap-[14px] p-[14px] bg-(--color-gray-50) rounded-(--radius-m)">
            <div className="w-[64px] h-[64px] shrink-0 bg-(--color-green-100) rounded-(--radius-s) flex flex-col justify-center items-center text-(--color-green-700) leading-[1.1]">
              <span className="font-caption-03">탄소</span>
              <span className="font-caption-03">CREDIT</span>
            </div>
            <div className="flex flex-col gap-[4px]">
              <div className="font-body-04 text-(--color-gray-900) leading-[1.3]">
                {productName}
              </div>
              <div className="font-button-02 text-(--color-green-600)">
                단가 {displayUnitPrice.toLocaleString()}원 (VAT 포함)
              </div>
            </div>
          </div>

          <div className="h-px bg-(--color-gray-100) w-full" />

          {/* 최대 구매 가능 수량 */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center">
              <span className="font-caption-01 text-(--color-gray-500)">
                최대 구매 가능 수량
              </span>
              <span className="font-caption-02 text-(--color-green-600)">
                {displayMaxQty.toLocaleString()} tCO2e
              </span>
            </div>
          </div>

          <div className="h-px bg-(--color-gray-100) w-full" />

          {/* 주문 수량 입력 */}
          <div className="flex flex-col gap-[8px]">
            <div className="font-body-04 text-(--color-gray-900)">
              주문 수량 입력
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={24}
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;

                  if (val === '' || /^\d+$/.test(val)) {
                    setAmount(val);
                  }
                }}
                className="bg-(--color-gray-50) w-full h-[56px] rounded-(--radius-m) border border-(--color-gray-100) py-0 pr-[72px] pl-[16px] font-header-04 text-(--color-gray-900) outline-none transition-all focus:border-(--color-green-600) box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-[16px] top-1/2 -translate-y-1/2 font-body-04 text-(--color-gray-900)">
                tCO2e
              </span>
            </div>
            {currentQty > displayMaxQty && displayMaxQty > 0 && (
              <div className="font-caption-01 text-error text-right mt-[-4px]">
                구매 가능 수량을 초과했습니다.
              </div>
            )}
          </div>

          <div className="h-px bg-(--color-gray-100) w-full" />

          {/* 결제 금액 요약 */}
          <div className="bg-(--color-gray-50) rounded-(--radius-m) p-[16px] flex flex-col gap-[8px]">
            <div className="flex justify-between items-center">
              <span className="font-caption-01 text-(--color-gray-600)">
                총 공급가액
              </span>
              <span className="font-caption-02 text-(--color-gray-900)">
                {displaySupply.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-caption-01 text-(--color-gray-600)">
                부가세 (VAT 10%)
              </span>
              <span className="font-caption-02 text-(--color-gray-900)">
                {displayVat.toLocaleString()}원
              </span>
            </div>
            <div className="h-px bg-(--color-gray-200) my-[4px]" />
            <div className="flex justify-between items-center">
              <span className="font-caption-02 text-(--color-gray-900)">
                총 결제 금액 (VAT 포함)
              </span>
              <span className="font-subtitle-01 text-(--color-green-600)">
                {displayTotal.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 동의 체크박스 */}
          <label className="flex gap-[8px] items-start cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-[2px] w-[16px] h-[16px] accent-(--color-green-600) shrink-0 cursor-pointer"
            />
            <span className="font-caption-01 text-(--color-gray-500) leading-[1.4]">
              본 주문 건의{' '}
              <a
                href="/policy"
                target="_blank"
                className="text-(--color-gray-600) underline underline-offset-2 font-caption-02"
              >
                이용약관
              </a>{' '}
              및{' '}
              <a
                href="/policy"
                target="_blank"
                className="text-(--color-gray-600) underline underline-offset-2 font-caption-02"
              >
                탄소거래규정
              </a>
              에 동의하며, 자산 매입 확약에 따른 결제를 진행합니다.
            </span>
          </label>

          {/* 주문 완료 버튼 */}
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={
              !isAgreed ||
              currentQty <= 0 ||
              currentQty > displayMaxQty ||
              isSubmitting
            }
            className="w-full h-[56px] rounded-(--radius-m) border-0 font-button-01 text-white transition-colors duration-200 disabled:bg-(--color-gray-200) disabled:text-(--color-gray-400) disabled:cursor-not-allowed enabled:bg-(--color-gray-700) enabled:hover:bg-(--color-gray-900) enabled:cursor-pointer"
          >
            {isSubmitting ? '처리 중...' : '주문 완료하기'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
