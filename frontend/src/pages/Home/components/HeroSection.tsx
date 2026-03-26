import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="layout-container">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center rounded-full bg-green-0 px-3.5 py-2 text-sm font-bold text-green-700">
              Green Investment
            </span>
            <h1 className="mt-6 text-[2.3rem] leading-[1.12] font-extrabold tracking-[-0.04em] text-gray-900 md:text-[3.6rem]">
              농장의 주인이 되는
              <br />
              <span className="text-green-600">가장 가벼운 방법</span>
            </h1>
            <p className="mt-4 text-[1.05rem] leading-[1.7] text-gray-500">
              어렵기만 했던 스마트팜 투자, 이제 STO 조각 투자로
              <br />
              수익과 탄소배출권까지 한 번에 관리하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-main" to="/auth/signup">
                지금 시작하기
              </Link>
              <button type="button" className="btn-sub">
                이용 가이드
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <img
              src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?q=80&w=600"
              alt="스마트팜"
              className="h-[320px] w-full max-w-[520px] rounded-[56px_144px_56px_56px] object-cover shadow-[0_20px_40px_rgba(17,24,39,0.08)] md:h-[400px]"
            />
          </div>
        </div>
      </section>
  )
}
