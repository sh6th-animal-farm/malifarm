// src/pages/Carbon/components/CarbonDiscountRateModal.tsx

interface CarbonDiscountRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarbonDiscountRateModal({ isOpen, onClose }: CarbonDiscountRateModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute top-[40px] left-[-15px] w-[400px] bg-white rounded-[24px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] p-[35px] z-50 !text-left !leading-[1.5] box-border">
        
        <div className="absolute top-[-10px] left-[25px] border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-white"></div>

        <h3 className="block !text-[20px] !font-extrabold !text-[#111] mb-[12px] p-0">탄소마켓이란?</h3>
        
        <p className="!text-[15px] !font-normal !text-[#444] !leading-[1.6] mb-[25px]">
          스마트팜 운영 및 친환경 농업 공법을 통해 감축한 탄소 배출권을 거래하는 시장입니다. 구매한 배출권은 기업의 탄소 중립 달성 및 ESG 경영 성과로 활용할 수 있습니다.
        </p>

        <h3 className="block !text-[20px] !font-extrabold !text-[#111] mb-[12px] mt-[25px] p-0">구매 할인 정책</h3>
        
        <div className="w-full">
          <div className="flex justify-between py-[12px] px-0 !text-[15px] text-[#888] !font-medium mt-[5px]">
            <span>토큰 지분</span>
            <span>추가 할인</span>
          </div>
          
          <div className="h-[1px] bg-[#eee] my-[2px]"></div>
          
          {[
            { label: "2% ~ 5% 지분", percent: "1%" },
            { label: "5% ~ 10% 지분", percent: "2.5%" },
            { label: "10% ~ 20% 지분", percent: "5%" },
            { label: "20% ~ 50% 지분", percent: "7.5%" },
            { label: "50% ~ 100% 지분", percent: "10%" },
          ].map((row, idx) => (
            <div key={idx} className="flex justify-between py-[8px] px-0 !text-[15px] text-[#333]">
              <span>{row.label}</span>
              <span className="!text-[#ff4d4f] !font-bold">{row.percent}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}