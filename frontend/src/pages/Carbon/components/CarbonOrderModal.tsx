// src/pages/Carbon/components/CarbonOrderModal.tsx
import { useState, useEffect } from "react";

interface CarbonOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cpId: number;
  productName: string;
  unitPrice: number;
  maxQty: number;
}

export default function CarbonOrderModal({ isOpen, onClose, cpId }: CarbonOrderModalProps) {
  // 모달 입력 및 동의 상태
  const [amount, setAmount] = useState<number>(1);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  // 화면과 똑같이 보이기 위한 임시 더미 데이터 (실제 연동 시 API 데이터로 교체하세요!)
  const unitPrice = 22500;
  const maxQty = 50000;
  const productName = "[논산] 설향 딸기 2호 탄소 감축형";

  // 금액 계산 (부가세 포함 단가 기준)
  const totalPrice = unitPrice * amount;
  const supplyPrice = Math.round(totalPrice / 1.1);
  const vat = totalPrice - supplyPrice;

  // 모달이 닫히면 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setAmount(1);
      setIsAgreed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // 배경(Backdrop) 래퍼 - 스크롤 가능하게 처리
    <div className="fixed inset-0 z- overflow-y-auto">
      {/* 반투명 배경 (.co-backdrop) */}
      <div className="fixed inset-0 bg-black/45" onClick={onClose} />

      {/* 모달 다이얼로그 본체 (.co-dialog) */}
      <div className="relative w-[min(520px,calc(100vw-32px))] my-[40px] mx-auto bg-white rounded-[var(--radius-l)] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden font-main">
        
        {/* 헤더 (.co-header) */}
        <div className="flex items-center justify-between py-[18px] px-[20px] border-b border-[var(--color-gray-100)]">
          <h3 className="m-0 font-subtitle-01 text-[var(--color-gray-900)]">주문 신청하기</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="flex items-center justify-center w-[32px] h-[32px] border-none bg-transparent text-[var(--color-gray-500)] text-[22px] cursor-pointer rounded-[var(--radius-s)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-gray-800)]"
          >
            ×
          </button>
        </div>

        {/* 본문 (.co-body) */}
        <div className="px-[20px] pt-[18px] pb-[20px]">
          
          {/* 상품 요약 카드 (.co-product) */}
          <div className="flex gap-[14px] items-center p-[14px] rounded-[var(--radius-m)] bg-[var(--color-gray-50)] border border-[var(--color-gray-100)]">
            {/* 배지 (.co-badge) */}
            <div className="shrink-0 w-[64px] h-[64px] rounded-[var(--radius-m)] bg-[var(--color-green-50)] flex flex-col justify-center items-center text-[var(--color-green-700)] font- leading-[1.05]">
              <span className="font-caption-02">탄소</span>
              <span className="font-caption-02">CREDIT</span>
            </div>
            {/* 상품 정보 */}
            <div>
              <div className="font-body-04 text-[var(--color-gray-900)] mb-[4px]">{productName}</div>
              <div className="font-caption-01 text-[var(--color-green-600)] font-">
                단가 <b className="font-bold">{unitPrice.toLocaleString()}</b>원 <span className="text-[var(--color-gray-500)] font-medium">(VAT 포함)</span>
              </div>
            </div>
          </div>

          {/* 최대 구매 가능 수량 (.co-row) */}
          <div className="flex justify-between items-center pt-[24px] pb-[6px] px-[2px]">
            <div className="font-caption-01 text-[var(--color-gray-500)]">최대 구매 가능 수량</div>
            <div className="font-body-03 text-[var(--color-gray-900)]">
              <span className="text-[var(--color-green-600)] font-">{maxQty.toLocaleString()}</span>
              <span className="text-[var(--color-green-600)] font- ml-[4px]">tCO2e</span>
            </div>
          </div>

          {/* 주문 수량 타이틀 */}
          <div className="mt-[8px] font-caption-03 text-[var(--color-gray-900)]">주문 수량 입력</div>
          
          {/* 주문 수량 입력창 (.co-qty-wrap & .co-qty-input) */}
          <div className="mt-[10px] relative">
            <input 
              type="number" 
              min="1" 
              max={maxQty}
              step="1" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              // 숫자 올림/내림 화살표(spinner) 숨김 및 포커스 스타일 적용
              className="w-full h-[56px] rounded-[var(--radius-m)] border-2 border-[var(--color-gray-200)] py-0 pr-[72px] pl-[16px] font-body-03 text-[var(--color-gray-900)] outline-none bg-white transition-all duration-150 placeholder:text-[var(--color-gray-300)] placeholder:font- focus:border-[var(--color-green-600)] focus:shadow-[0_0_0_4px_rgba(74,159,46,0.18)] box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-[16px] top-1/2 -translate-y-1/2 font-body-03 text-[var(--color-gray-700)] font-">tCO2e</span>
          </div>
          
          {/* 에러 힌트 영역 (.co-hint) */}
          <div className="mt-[8px] min-h-[16px] font-caption-01 text-[var(--color-error)] text-right">
            {amount > maxQty ? "구매 가능 수량을 초과했습니다." : ""}
          </div>

          {/* 금액 요약 (.co-summary) */}
          <div className="mt-[14px] bg-[var(--color-gray-50)] rounded-[var(--radius-m)] p-[14px] border border-[var(--color-gray-100)]">
            <div className="flex justify-between py-[6px] font-body-02 text-[var(--color-gray-700)]">
              <span>총 공급가액</span>
              <b className="text-[var(--color-gray-900)] font-">{supplyPrice.toLocaleString()}원</b>
            </div>
            <div className="flex justify-between py-[6px] font-body-02 text-[var(--color-gray-700)]">
              <span>부가세 (VAT 10%)</span>
              <b className="text-[var(--color-gray-900)] font-">{vat.toLocaleString()}원</b>
            </div>

            <div className="h-[1px] bg-[var(--color-gray-100)] my-[10px]"></div>

            <div className="flex justify-between py-[6px] font-body-03 text-[var(--color-gray-900)] items-center">
              <span>총 결제 금액 (VAT포함)</span>
              <b className="text-[var(--color-green-600)] text-[20px] font-">{totalPrice.toLocaleString()}원</b>
            </div>
          </div>

          {/* 동의 체크박스 (.co-agree) */}
          <label className="flex gap-[10px] items-start mt-[14px] font-caption-01 text-[var(--color-gray-600)] cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-[2px] w-[16px] h-[16px] accent-[var(--color-green-600)] shrink-0 cursor-pointer" 
            />
            <span>
              본 주문 건의 <a href="/policy?tab=marifarm" target="_blank" rel="noopener noreferrer" className="text-[var(--color-green-600)] underline underline-offset-[3px] font- hover:text-[var(--color-green-700)]">이용약관</a> 및 <a href="/policy?tab=carbon" target="_blank" rel="noopener noreferrer" className="text-[var(--color-green-600)] underline underline-offset-[3px] font- hover:text-[var(--color-green-700)]">탄소거래규정</a>에 동의하며, 자산 매입 확약에 따른 결제를 진행합니다.
            </span>
          </label>

          {/* 주문 완료 버튼 (.co-submit) */}
          <button 
            type="button" 
            disabled={!isAgreed || amount <= 0 || amount > maxQty}
            className="mt-[14px] w-full h-[56px] border-0 rounded-[var(--radius-m)] font-button-01 transition-all duration-150 disabled:bg-[var(--color-gray-200)] disabled:text-[var(--color-gray-400)] disabled:cursor-not-allowed enabled:bg-[var(--color-green-600)] enabled:text-white enabled:hover:bg-[var(--color-green-700)] enabled:active:translate-y-[1px] enabled:cursor-pointer"
          >
            주문 완료하기
          </button>

        </div>
      </div>
    </div>
  );
}