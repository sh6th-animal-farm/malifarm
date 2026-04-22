import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { newsApi } from "@/api/newsApi";
import type { MarketNewsDTO } from "@/types/newsType";

export default function BreakingNewsTicker() {
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
        console.error("속보 티커 로딩 실패:", error);
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
    <section className="bg-white py-4 md:py-5">
      <div className="w-full px-4 md:px-8 xl:px-18">
        <button
          type="button"
          onClick={() => currentNews && navigate(`/news/${currentNews.newsId}`)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-s)] border border-gray-200 bg-white px-4 py-3 text-left shadow-std transition-colors duration-200 hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-white"
          disabled={!currentNews}
          aria-label="현재 뉴스 보기"
        >
          <span className="shrink-0 rounded-full bg-green-600 px-2 py-1 text-[11px] font-bold leading-none text-white">
            속보
          </span>
          <span className="min-w-0 flex-1 truncate font-caption-03 text-gray-900">
            {currentNews?.title ?? "최신 뉴스를 불러오는 중입니다..."}
          </span>
        </button>
      </div>
    </section>
  );
}
