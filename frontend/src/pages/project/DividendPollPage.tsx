import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DividendPollAddressModal from './components/DividendPollAddressModal';

type DividendType = 'CASH' | 'CROP';

type PostcodeAddressData = {
  userSelectedType: 'R' | 'J';
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: 'Y' | 'N';
};

const mockDividend = {
  amountAfterTax: 128450,
  pollEndDisplay: '2026.04.21 18:00',
};

export default function DividendPollPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedType, setSelectedType] = useState<DividendType>('CASH');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

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
      alert('주소 검색 기능이 아직 연결되지 않았습니다.');
      return;
    }

    new daumPostcode({
      oncomplete: (data) => {
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

  const handleSubmit = () => {
    if (selectedType === 'CROP') {
      setIsAddressModalOpen(true);
      return;
    }

    alert('현금 수령 방식이 선택되었습니다.');
    navigate(id ? `/project/${id}` : '/project');
  };

  const handleConfirmCrop = () => {
    if (!fullAddress) {
      alert('배송지를 먼저 입력해 주세요.');
      return;
    }

    alert(`농산물 수령 방식이 선택되었습니다.\n배송지: ${fullAddress}`);
    setIsAddressModalOpen(false);
    navigate(id ? `/project/${id}` : '/project');
  };

  return (
    <>
      <section className="bg-[linear-gradient(180deg,#f6fff1_0%,#ffffff_24%,#ffffff_100%)] py-10 md:py-16">
        <div className="layout-container">
          <div className="mx-auto max-w-[560px]">
            <div className="mb-6">
              <p className="font-caption-03 uppercase tracking-[0.08em] text-green-700">
                Dividend Poll
              </p>
              <h1 className="mt-2 font-header-01 text-gray-900">
                배당 수령 방식을 선택해 주세요
              </h1>
              <p className="mt-3 font-body-01 text-gray-600">
                배당금은 현금으로 받을 수도 있고, 프로젝트와 연결된 농산물로
                받을 수도 있습니다. 마감 전까지 원하는 방식을 선택해 주세요.
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-green-100 bg-white shadow-[var(--shadow-weak)]">
              <div className="border-b border-green-100 bg-[linear-gradient(135deg,#efffe7_0%,#f6fff1_58%,#ffffff_100%)] px-6 py-7 md:px-8">
                <p className="font-caption-02 text-green-800">
                  예상 배당금(세후)
                </p>
                <p className="mt-3 font-header-00 text-green-700">
                  {mockDividend.amountAfterTax.toLocaleString()}원
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
                      <p className="font-body-04 text-gray-900">현금으로 받기</p>
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
                      <p className="font-body-04 text-gray-900">농산물로 받기</p>
                      <p className="mt-1 font-caption-01 text-gray-500">
                        제철 수확물 기준으로 우선 배송해 드립니다.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-6 rounded-[16px] border-l-4 border-warning bg-warning-light px-4 py-3">
                  <p className="font-caption-02 text-gray-700">
                    마감기한:{' '}
                    <strong className="font-body-03 text-gray-900">
                      {mockDividend.pollEndDisplay}
                    </strong>
                  </p>
                  <p className="mt-1 font-caption-01 text-gray-600">
                    기한 내 미선택 시 기본 수령 방식인 현금으로 자동 확정됩니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-6 w-full rounded-[16px] bg-green-600 px-4 py-4 font-button-01 text-white transition-colors hover:bg-green-700"
                >
                  선택 완료
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
    </>
  );
}
