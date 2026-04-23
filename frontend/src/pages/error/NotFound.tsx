import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import notFoundImage from '@/assets/icons/404.png';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-gray-50">
      <div className="layout-container py-8 md:py-12 lg:py-16">
        <div className="mx-auto flex w-full max-w-[880px] flex-col items-center rounded-[28px] bg-white px-6 py-8 shadow-std md:px-10 md:py-12">
          <div className="w-full max-w-[240px] md:max-w-[280px]">
            <img
              src={notFoundImage}
              alt="페이지를 찾을 수 없음"
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="mt-4 text-center font-header-02 text-gray-900 md:mt-5">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-3 max-w-[560px] text-center font-body-02 leading-[1.6] text-gray-500 md:mt-4">
            주소가 변경되었거나 삭제된 페이지입니다.
            <br className="hidden md:block" />
            URL을 다시 확인하거나 아래 버튼으로 이동해주세요.
          </p>

          <div className="mt-7 flex w-full max-w-[420px] flex-col gap-3 md:mt-9 md:flex-row">
            <Button
              type="button"
              variant="outline-default"
              width="100%"
              height={48}
              onClick={() => navigate(-1)}
              className="font-button-02"
            >
              이전 페이지
            </Button>
            <Button
              type="button"
              variant="check"
              width="100%"
              height={48}
              onClick={() => navigate('/')}
              className="font-button-02"
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
