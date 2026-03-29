interface InputProps {
  value: number | string;
  onChange: (val: string) => void;
  errorMsg: string | null;
  label: string;
  unit: string;
  minAmountText: string;
}

export const SubscriptionModalInput = ({
  value,
  onChange,
  errorMsg,
  label,
  unit,
  minAmountText,
}: InputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // 1. 소수점 4자리 제한 정규식
    const regex = /^\d*\.?\d{0,4}$/;
    if (val !== '' && !regex.test(val)) return;

    // 2. [핵심] 앞자리에 0이 붙는 모든 케이스 방어
    // "0"이 있는 상태에서 숫자를 치면 (예: "0" -> "06") 앞의 0을 지움
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
    }

    // 3. 만약 사용자가 다 지웠을 때 부모 hook이 0으로 바꾸지 못하게
    // 빈 문자열("") 그대로 넘겨줌
    onChange(val);
  };

  return (
    <div className="mb-1">
      <label className="block text-sm font-body-04 text-gray-800 mb-2.5">
        {label}
      </label>

      <div
        className={`flex items-center gap-2 border-[1.5px] h-[60px] rounded-[12px] px-4 transition-all ${
          errorMsg
            ? 'border-red-500 bg-red-50'
            : 'border-gray-900 focus-within:ring-2 focus-within:ring-gray-900'
        }`}
      >
        <input
          type="number"
          inputMode="decimal"
          className="flex-1 text-right font-header-04 bg-transparent outline-none border-none focus:ring-0"
          value={value}
          onChange={handleInputChange}
          step="0.0001"
          placeholder="0" // 값이 비어있을 때만 회색으로 0이 보임
        />
        <span className="text-sm font-body-04 text-gray-800 shrink-0">
          {unit}
        </span>
      </div>

      <div className="mt-1 text-right min-h-[20px]">
        {errorMsg ? (
          <p className="text-error font-caption-01 text-red-500">{errorMsg}</p>
        ) : (
          <p className="text-gray-400 font-caption-01">{minAmountText}</p>
        )}
      </div>
    </div>
  );
};
