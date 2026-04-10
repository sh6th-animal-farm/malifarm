import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/layout/SectionHeader";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import Icon from "@/components/icon";
import { mockNews } from "./mockNews";

function NewsRow({
  id,
  source,
  title,
  summary,
  publishedAt,
}: {
  id: number;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/news/${id}`)}
      className="group grid w-full cursor-pointer gap-3 border-b border-gray-100 px-3 py-6 text-left outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:bg-gray-50 active:bg-gray-100 last:border-b-0 md:grid-cols-[minmax(0,1fr)_40px]"
    >
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-gray-400">
          <span className="font-caption-01">{source}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <time className="font-caption-01">{publishedAt}</time>
        </div>
        <h3 className="mb-2 font-body-03 text-gray-900 transition-colors group-hover:text-green-700">
          {title}
        </h3>
        <p className="line-clamp-2 font-body-01 text-gray-500">
          {summary}
        </p>
      </div>

      <div className="flex items-center justify-end">
        <Icon
          name="chevron_right"
          size={20}
          className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
        />
      </div>
    </button>
  );
}

export default function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const filteredNews = mockNews;

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentItems = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main className="">
      <section className="layout-container py-20 md:py-20">
        <SectionHeader
          title="뉴스"
          subtitle="마리팜의 토큰 시장 흐름을 기사형 콘텐츠로 전해드립니다."
          className="mb-8"
        />

        {currentItems.length > 0 ? (
          <div>
            {currentItems.map((item) => (
              <NewsRow
                key={item.id}
                id={item.id}
                source={item.source}
                title={item.title}
                summary={item.summary}
                publishedAt={item.publishedAt}
              />
            ))}
          </div>
        ) : (
          <div className="py-24">
            <EmptyState message="표시할 뉴스가 없습니다." />
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
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
