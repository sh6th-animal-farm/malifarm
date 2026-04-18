import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const ADDRESS_DELIMITER = '|||';

interface AddressModalProps {
  isOpen: boolean;
  addressDraft: string;
  savingAddress: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
}

export default function AddressModal({
  isOpen,
  addressDraft,
  savingAddress,
  onClose,
  onSave,
}: AddressModalProps) {
  const [displayAddress, setDisplayAddress] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const detailAddressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const normalized = addressDraft.trim();
    const delimiterIndex = normalized.lastIndexOf(ADDRESS_DELIMITER);
    const nextBaseAddress =
      delimiterIndex >= 0
        ? normalized.slice(0, delimiterIndex).trim()
        : normalized;
    const nextDetailAddress =
      delimiterIndex >= 0
        ? normalized.slice(delimiterIndex + ADDRESS_DELIMITER.length).trim()
        : '';

    setBaseAddress(nextBaseAddress);
    setDetailAddress(nextDetailAddress);
    setDisplayAddress(nextBaseAddress || '주소 등록이 필요합니다.');
  }, [addressDraft, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Enter') {
        const target = event.target as HTMLElement | null;
        const tagName = target?.tagName;
        if (tagName === 'INPUT' || tagName === 'BUTTON') {
          event.preventDefault();
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, baseAddress, detailAddress]);

  const showDetailAddressInput = baseAddress.length > 0;

  const finalAddress = useMemo(() => {
    const normalizedBaseAddress = baseAddress.trim();
    const normalizedDetail = detailAddress
      .replaceAll(ADDRESS_DELIMITER, ' ')
      .trim();

    if (!normalizedBaseAddress) return '';
    return normalizedDetail
      ? `${normalizedBaseAddress}${ADDRESS_DELIMITER}${normalizedDetail}`
      : normalizedBaseAddress;
  }, [baseAddress, detailAddress]);

  const handleSearchAddress = () => {
    const daumPostcode = (
      window as Window & {
        daum?: {
          Postcode?: new (options: {
            oncomplete: (data: {
              userSelectedType: string;
              roadAddress: string;
              jibunAddress: string;
              bname: string;
              buildingName: string;
              apartment: string;
            }) => void;
          }) => { open: () => void };
        };
      }
    ).daum?.Postcode;

    if (!daumPostcode) {
      alert('주소 검색 스크립트가 로드되지 않았습니다.');
      return;
    }

    new daumPostcode({
      oncomplete: (data: {
        userSelectedType: string;
        roadAddress: string;
        jibunAddress: string;
        bname: string;
        buildingName: string;
        apartment: string;
      }) => {
        let address =
          data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

        let extraAddress = '';
        if (data.bname && /[동|로|가]$/g.test(data.bname)) {
          extraAddress += data.bname;
        }
        if (data.buildingName && data.apartment === 'Y') {
          extraAddress += extraAddress
            ? `, ${data.buildingName}`
            : data.buildingName;
        }
        if (extraAddress) {
          address += ` (${extraAddress})`;
        }

        setBaseAddress(address);
        setDetailAddress('');
        setDisplayAddress(address);

        window.setTimeout(() => {
          detailAddressRef.current?.focus();
        }, 0);
      },
    }).open();
  };

  const handleChangeDetailAddress = (value: string) => {
    const normalizedDetailAddress = value.replaceAll(ADDRESS_DELIMITER, ' ');
    setDetailAddress(normalizedDetailAddress);
  };

  const handleSave = () => {
    const normalizedDetail = detailAddress.trim();
    if (!baseAddress.trim()) {
      alert('주소 검색 후 저장해주세요.');
      return;
    }

    if (!normalizedDetail) {
      alert('상세주소를 입력해주세요.');
      return;
    }

    const normalized = finalAddress.trim();
    onSave(normalized);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[440px] rounded-lg bg-white shadow-std">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <h3 className="font-body-03 text-gray-700">주소 수정</h3>
          <button
            type="button"
            className="cursor-pointer font-subtitle-01 text-gray-700"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 h-[50px] rounded-[var(--radius-s)] border border-gray-200 bg-gray-50 p-3">
              <p className="min-w-0 flex-1 break-all font-body-01 text-gray-700">
                {displayAddress}
              </p>
            </div>

            <Button
              type="button"
              variant="sub_modalCheck"
              width={88}
              height={50}
              className="shrink-0 font-button-02"
              onClick={handleSearchAddress}
            >
              주소 검색
            </Button>
          </div>

          {showDetailAddressInput ? (
            <div>
              <Input
                ref={detailAddressRef}
                type="text"
                value={detailAddress}
                onChange={(event) =>
                  handleChangeDetailAddress(event.target.value)
                }
                placeholder="상세주소를 입력해주세요"
              />
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 px-4 py-4 md:px-6 md:pb-6">
          <Button
            type="button"
            variant="subscriptionEnd"
            width={100}
            height={50}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="check"
            width={300}
            height={50}
            onClick={handleSave}
            disabled={savingAddress}
          >
            {savingAddress ? '저장중' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
