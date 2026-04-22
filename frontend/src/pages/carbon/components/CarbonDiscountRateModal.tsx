interface CarbonDiscountRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const discountRows = [
  { label: "2% ~ 5%", percent: "1%" },
  { label: "5% ~ 10%", percent: "2.5%" },
  { label: "10% ~ 20%", percent: "5%" },
  { label: "20% ~ 50%", percent: "7.5%" },
  { label: "50% ~ 100%", percent: "10%" },
];

export default function CarbonDiscountRateModal({ isOpen, onClose }: CarbonDiscountRateModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute top-[40px] left-[-15px] z-50 box-border w-[400px] rounded-lg bg-white p-6 text-left shadow-std">
        
        <div className="absolute top-[-10px] left-[25px] border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-white"></div>

        <h3 className="mb-3 p-0 font-subtitle-01 text-gray-900">탄소마켓이란?</h3>
        
        <p className="mb-6 font-body-01 leading-[1.65] text-gray-600">
          스마트팜 운영 및 친환경 농업 공법을 통해 감축한 탄소 배출권을 거래하는 시장입니다. 구매한 배출권은 기업의 탄소 중립 달성 및 ESG 경영 성과로 활용할 수 있습니다.
        </p>

        <h3 className="mb-3 p-0 font-subtitle-01 text-gray-900">구매 할인 정책</h3>
        
        <div className="w-full">
          <div className="flex items-center justify-between font-caption-01 text-gray-400">
            <span>토큰 지분</span>
            <span>추가 할인</span>
          </div>
          
          <div className="my-1 h-px bg-gray-100" />
          
          {discountRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-0 py-[9px] font-body-02 text-gray-700">
              <span>{row.label}</span>
              <span className="font-body-04 tabular-nums text-error">{row.percent}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
