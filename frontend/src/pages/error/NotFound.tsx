import { useNavigate } from 'react-router-dom';
import notFoundImage from '@/assets/icons/404.png';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-gray-50">
      <div className="layout-container py-10 md:py-14 lg:py-20">
        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center rounded-[var(--radius-l)] border border-gray-100 bg-white px-6 py-10 shadow-std md:px-10 md:py-14">
          <img
            src={notFoundImage}
            alt="페이지를 찾을 수 없음"
            className="w-full max-w-[520px] object-contain"
          />

          <h1 className="mt-8 text-center font-header-02 text-gray-900 md:mt-10">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-3 text-center font-body-02 text-gray-500 md:mt-4">
            주소가 변경되었거나 삭제된 페이지입니다.
            <br className="hidden md:block" />
            URL을 다시 확인하거나 아래 버튼으로 이동해주세요.
          </p>

          <div className="mt-8 flex w-full max-w-[420px] flex-col gap-3 md:mt-10 md:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-[50px] w-full rounded-[var(--radius-s)] border border-gray-200 bg-white font-button-02 text-gray-700 transition-colors hover:bg-gray-50"
            >
              이전 페이지
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="h-[50px] w-full rounded-[var(--radius-s)] border border-green-600 bg-green-600 font-button-02 text-white transition-colors hover:border-green-700 hover:bg-green-700"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
