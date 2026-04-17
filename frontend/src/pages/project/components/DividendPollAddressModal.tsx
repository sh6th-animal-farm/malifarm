interface DividendPollAddressModalProps {
  isOpen: boolean;
  address: string;
  detailAddress: string;
  onClose: () => void;
  onAddressSearch: () => void;
  onDetailAddressChange: (value: string) => void;
  onConfirm: () => void;
}

export default function DividendPollAddressModal({
  isOpen,
  address,
  detailAddress,
  onClose,
  onAddressSearch,
  onDetailAddressChange,
  onConfirm,
}: DividendPollAddressModalProps) {
  if (!isOpen) return null;

  const fullAddress = [address, detailAddress].filter(Boolean).join(' ');

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-[440px] rounded-[20px] border border-gray-100 bg-white p-6 shadow-[var(--shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-header-03 text-gray-900">배송지 확인</h3>
            <p className="mt-2 font-body-01 text-gray-600">
              선택하신 농산물을 아래 주소로 발송할 예정입니다.
            </p>
          </div>
          <button
            type="button"
            className="text-[28px] leading-none text-gray-400 transition-colors hover:text-gray-800"
            onClick={onClose}
            aria-label="배송지 확인 모달 닫기"
          >
            &times;
          </button>
        </div>

        <div className="mt-6 rounded-[16px] border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <p className="min-h-[44px] flex-1 break-words font-body-01 text-gray-800">
              {fullAddress || '등록된 주소가 없습니다. 주소를 먼저 입력해 주세요.'}
            </p>
            <button
              type="button"
              className="shrink-0 rounded-full border border-green-200 bg-white px-4 py-2 font-button-02 text-green-700 transition-colors hover:border-green-400 hover:bg-green-0"
              onClick={onAddressSearch}
            >
              주소 찾기
            </button>
          </div>

          <div className="mt-4">
            <label
              htmlFor="detailAddress"
              className="mb-2 block font-caption-02 text-gray-700"
            >
              상세 주소
            </label>
            <input
              id="detailAddress"
              type="text"
              value={detailAddress}
              onChange={(e) => onDetailAddressChange(e.target.value)}
              placeholder="동, 호수 등 상세 주소를 입력해 주세요"
              className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-[14px] font-body-01 text-gray-800 outline-none transition-colors focus:border-green-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-[14px] bg-gray-900 px-4 py-4 font-button-01 text-white transition-colors hover:bg-gray-700"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="flex-1 rounded-[14px] bg-green-600 px-4 py-4 font-button-01 text-white transition-colors hover:bg-green-700"
            onClick={onConfirm}
          >
            배송지 확정
          </button>
        </div>
      </div>
    </div>
  );
}
