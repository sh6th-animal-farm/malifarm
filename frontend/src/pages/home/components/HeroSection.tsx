export default function HeroSection() {
  return (
    <section className="bg-white py-0 md:pb-18">
      <div className="layout-container">
        <div className="relative min-h-[540px] overflow-hidden rounded-2xl md:min-h-[700px]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/main_video_1.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />

          <div className="relative z-10 flex min-h-[540px] items-end pb-12 pl-6 pr-6 md:min-h-[700px] md:pb-20 md:pl-12">
            <div className="max-w-[760px]">
              <p className="mb-4 inline-flex items-center gap-2 font-caption-03 uppercase tracking-[0.08em] text-white/85">
                <span className="h-px w-8 bg-white/70" />
                Smart Farm STO
              </p>
              <h1 className="font-header-hero tracking-[-0.02em] text-white">
                <span className="inline-flex items-end text-[1.16em] font-[800] leading-none text-lime-300">
                  <span className="relative inline-block">
                    <span className="pointer-events-none absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lime-300" />
                    수
                  </span>
                  <span>확</span>
                </span>
                의 기쁨을
                <br />
                <span className="inline-flex items-end text-[1.16em] font-[800] leading-none text-emerald-300">
                  <span>수</span>
                  <span className="relative inline-block">
                    <span className="pointer-events-none absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-300" />
                    익
                  </span>
                </span>
                으로 연결하다
              </h1>
              <p className="mt-6 max-w-[560px] font-subtitle-02 text-white/90">
                농장의 성장을 데이터로 확인하고, 투자 성과를 한 화면에서 간결하게 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
