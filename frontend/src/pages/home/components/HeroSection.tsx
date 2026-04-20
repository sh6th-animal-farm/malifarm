import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { newsApi } from "@/api/newsApi";
import type { MarketNewsDTO } from "@/types/newsType";

export default function HeroSection() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<MarketNewsDTO[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchNews = async () => {
      try {
        const list = await newsApi.getGlobalList();
        if (!mounted) return;
        setNewsList(list.slice(0, 8));
      } catch (error) {
        console.error("히어로 뉴스 로딩 실패:", error);
        if (!mounted) return;
        setNewsList([]);
      }
    };

    fetchNews();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (newsList.length < 2) return;

    const timer = window.setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsList.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [newsList.length]);

  const currentNews = newsList[currentNewsIndex];

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-black lg:-mt-[var(--spacing-header-height)]"
    >
      <div className="relative h-[100svh] overflow-hidden lg:h-screen">
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

        <div className="relative z-10 h-full">
          <div className="flex h-full w-full items-end px-4 pb-14 md:px-8 md:pb-18 lg:pb-18 xl:px-18">
            <div className="w-full max-w-[760px]">
              <p className="mb-4 inline-flex items-center gap-2 font-caption-03 uppercase tracking-[0.08em] text-white/85">
                <span className="h-px w-8 bg-white/70" />
                Smart Farm STO
              </p>
              <h1 className="font-header-hero tracking-[-0.02em] text-white drop-shadow-[0_0px_8px_rgba(0,0,0,0.4)]">
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
              <p className="mt-6 max-w-[560px] font-subtitle-02 text-white/90 drop-shadow-[0_0px_8px_rgba(0,0,0,0.5)]">
                농장의 성장을 데이터로 확인하고, 투자 성과를 한 화면에서 간결하게 관리하세요.
              </p>

              <button
                type="button"
                onClick={() => currentNews && navigate(`/news/${currentNews.newsId}`)}
                className="mt-6 flex w-full max-w-[760px] cursor-pointer items-center gap-3 rounded-[var(--radius-s)] border border-white/30 bg-black/35 px-4 py-3 text-left backdrop-blur-sm transition-colors duration-200 hover:bg-black/50 disabled:cursor-default disabled:hover:bg-black/35"
                disabled={!currentNews}
                aria-label="현재 뉴스 보기"
              >
                <span className="shrink-0 rounded-full bg-green-600 px-2 py-1 text-[11px] font-bold leading-none text-white">
                  속보
                </span>
                <span className="min-w-0 flex-1 truncate font-caption-03 text-white">
                  {currentNews?.title ?? "최신 뉴스를 불러오는 중입니다..."}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
