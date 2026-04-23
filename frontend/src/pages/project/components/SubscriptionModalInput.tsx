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
  // 천 단위 콤마 변환 함수 (소수점 유지)
  const formatComma = (val: string | number) => {
    if (!val && val !== 0) return '';
    const parts = val.toString().split('.');
    // 정수 부분에만 콤마 적용
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. 콤마 제거 후 원본 숫자 데이터만 추출
    let val = e.target.value.replace(/,/g, '');

    // 2. 소수점 4자리 제한 정규식
    const regex = /^\d*\.?\d{0,4}$/;
    if (val !== '' && !regex.test(val)) return;

    // 3. 앞자리에 0이 붙는 모든 케이스 방어
    // "0"이 있는 상태에서 숫자를 치면 (예: "0" -> "06") 앞의 0을 지움
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
    }

    // 4. 소수점으로 시작하면 앞에 0 붙여주기
    if (val.startsWith('.')) {
      val = '0' + val;
    }

    // 5. 만약 사용자가 다 지웠을 때 부모 hook이 0으로 바꾸지 못하게
    // 빈 문자열("") 그대로 넘겨줌
    onChange(val);
  };

  return (
    <div className="mb-5">
      <label className="block text-sm font-body-04 text-gray-800 mb-2.5">
        {label}
      </label>

      <div
        className={`flex items-center gap-2 border-[1.5px] h-[60px] rounded-[12px] px-4 transition-all ${
          errorMsg
            ? 'border-red-500 bg-red-50'
            : 'border-gray-600 focus-within:ring-0.5 focus-within:ring-gray-600'
        }`}
      >
        <input
          type="text"
          inputMode="decimal"
          className="flex-1 text-right text-gray-600 font-header-04 bg-transparent outline-none border-none focus:ring-0"
          value={formatComma(value)}
          onChange={handleInputChange}
          step="0.0001"
          maxLength={20}
          placeholder="0" // 값이 비어있을 때만 회색으로 0이 보임
        />
        <span className="text-sm font-body-04 text-gray-600 shrink-0">
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
