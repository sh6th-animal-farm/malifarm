import { useState } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import Pagination from "@/components/common/Pagination";
import NewsList from "./components/NewsList";
import { mockNews } from "./mockNews";

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

        <NewsList items={currentItems} />

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
