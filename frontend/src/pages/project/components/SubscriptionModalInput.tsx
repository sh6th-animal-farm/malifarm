interface InputProps {
  value: number | string;
  onChange: (val: string) => void;
  errorMsg: string | null;
  // --- 새로 추가된 Props (텍스트 주입용) ---
  label: string;             // 예: "청약 수량 입력", "매수 수량"
  unit: string;              // 예: "토큰", "주", "ETH"
  minAmountText: string;     // 예: "* 최소 청약 금액: 10,000원" (통째로 주입)
}

export const SubscriptionModalInput = ({ 
  value, 
  onChange, 
  errorMsg, 
  label, 
  unit, 
  minAmountText 
}: InputProps) => (
  <div className="mb-1">
    {/* 1. 상단 라벨 */}
    <label className="block text-sm font-body-04 text-gray-800 mb-2.5">
      {label}
    </label>

    <div className={`flex items-center gap-2 border-[1.5px] h-[60px] rounded-[12px] px-4 transition-all ${
      errorMsg ? 'border-red-500 bg-red-50' : 'border-gray-900'
    }`}>
      <input 
        type="number" 
        className="flex-1 text-right font-header-04 bg-transparent outline-none border-none focus:ring-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step="0.0001"
      />
      {/* 2. 단위 (토큰, 주 등) */}
      <span className="text-sm font-body-04 text-gray-800 shrink-0">
        {unit}
      </span>
    </div>

    <div className="mt-1 text-right min-h-[20px]">
      {errorMsg ? (
        // 에러 발생 시 에러 메시지 우선 노출
        <p className="text-error font-caption-01">{errorMsg}</p>
      ) : (
        // 3. 하단 안내 문구
        <p className="text-gray-400 font-caption-01">{minAmountText}</p>
      )}
    </div>
  </div>
);