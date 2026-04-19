import heroSmartFarm from "@/assets/hero-smart-farm.png";

export default function HeroSection() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
      <div className="relative min-h-[100svh]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/main_video_1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={heroSmartFarm}
          aria-hidden="true"
        />

        {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/50 to-transparent md:w-56" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/50 to-transparent md:w-56" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/26 to-transparent md:h-32" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/26 to-transparent md:h-32" /> */}

        <div className="layout-container relative z-10 flex min-h-[100svh] items-end pb-16 md:pb-24">
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
    </section>
  );
}
