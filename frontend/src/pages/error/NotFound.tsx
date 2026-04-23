import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import notFoundImage from '@/assets/icons/404.png';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="w-full min-h-[calc(var(--app-height)-48px-env(safe-area-inset-top)-var(--bottom-tabbar-height))] lg:min-h-0">
      <div className="layout-container flex min-h-[calc(var(--app-height)-48px-env(safe-area-inset-top)-var(--bottom-tabbar-height))] items-center justify-center py-0 lg:min-h-0 lg:py-20">
        <div className="mx-auto flex w-full max-w-[540px] flex-col items-center rounded-[28px] bg-white px-6 py-8 md:px-10 md:py-12">
          <div className="w-full max-w-[240px] md:max-w-[280px]">
            <img
              src={notFoundImage}
              alt="페이지를 찾을 수 없음"
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="text-center font-header-02 text-gray-800 ">
            페이지를 찾을 수 없습니다
          </h1>
          {/* <p className="mt-3 max-w-[560px] text-center font-body-02 leading-[1.6] text-gray-500 md:mt-4">
            올바르지 않은 주소입니다.
          </p> */}

          <div className="mt-4 flex w-full max-w-[420px] flex-col justify-center gap-3 flex-row">
            <Button
              type="button"
              variant="check"
              width={200}
              height={48}
              onClick={() => navigate('/')}
              className="font-button-01"
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
