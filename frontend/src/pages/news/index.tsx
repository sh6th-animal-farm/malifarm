import { useEffect, useState } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import Pagination from "@/components/common/Pagination";
import NewsList from "./components/NewsList";
import { newsApi } from "@/api/newsApi";
import type { MarketNewsDTO, NewsListItem } from "@/types/newsType";

const formatDate = (value: string): string => {
  const dateOnly = value.includes("T") ? value.split("T")[0] : value;
  return dateOnly.replace(/-/g, ".");
};

const formatHour = (value: string): string => {
  const timePart = value.includes("T")
    ? value.split("T")[1]
    : value.split(" ")[1] ?? "";
  const hour = Number.parseInt(timePart.slice(0, 2), 10);
  if (Number.isNaN(hour)) return "";
  return `${hour}시`;
};

const toNewsListItem = (item: MarketNewsDTO): NewsListItem => {
  return {
    id: item.newsId,
    hourLabel: formatHour(item.createdAt),
    source: "마리팜 뉴스",
    title: item.title ?? item.summaryShort ?? "",
    summary: item.summaryText ?? "",
    publishedAt: formatDate(item.createdAt),
  };
};

export default function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const [newsItems, setNewsItems] = useState<NewsListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    let mounted = true;

    const fetchNewsList = async () => {
      setIsLoading(true);
      try {
        const list = (await newsApi.getGlobalList()).map(toNewsListItem);
        if (!mounted) return;
        setNewsItems(list);
      } catch (error) {
        console.error("뉴스 목록 로딩 실패:", error);
        if (!mounted) return;
        setNewsItems([]);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNewsList();

    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const currentItems = newsItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main className="">
      <section className="layout-container py-10 sm:py-14 md:py-20">
        <SectionHeader
          title="뉴스"
          subtitle="마리팜의 토큰 시장 흐름을 기사형 콘텐츠로 전해드립니다."
          className="mb-8"
        />

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center border-t-2 border-b-2 border-gray-600 px-4 py-14 text-center text-sm text-gray-400 md:min-h-48 md:py-24 md:text-base">
            뉴스를 불러오는 중입니다...
          </div>
        ) : (
          <NewsList items={currentItems} />
        )}

        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex justify-center md:mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </main>
  );
}
