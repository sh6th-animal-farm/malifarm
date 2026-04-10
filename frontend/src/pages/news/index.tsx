import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/layout/SectionHeader";
import Pagination from "@/components/common/Pagination";
import FilterGroup from "@/components/common/FilterGroup";
import EmptyState from "@/components/common/EmptyState";
import Icon from "@/components/icon";
import { mockNews } from "./mockNews";

function NewsLeadCard({ id }: { id: number }) {
  const navigate = useNavigate();
  const lead = mockNews.find((item) => item.id === id);

  if (!lead) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(`/news/${lead.id}`)}
      className="grid w-full cursor-pointer gap-6 rounded-[28px] bg-gray-50 px-6 py-7 text-left transition-colors hover:bg-green-0 md:grid-cols-[minmax(0,1fr)_220px] md:px-8 md:py-8"
    >
      <div className="min-w-0">
        <div className="mb-4 flex items-center gap-3 text-gray-500">
          <span className="font-caption-03 text-green-700">{lead.section}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span className="font-caption-01">{lead.source}</span>
        </div>
        <h3 className="mb-4 font-header-03 text-gray-900 md:font-header-02">
          {lead.title}
        </h3>
        <p className="max-w-[720px] font-body-01 text-gray-600">
          {lead.summary}
        </p>
      </div>

      <div className="flex flex-col items-start justify-between rounded-[24px] bg-white px-5 py-5 md:items-end">
        <span className="font-caption-01 text-gray-400">{lead.publishedAt}</span>
        <div className="mt-10 flex items-center gap-2 text-green-700 md:mt-0">
          <span className="font-caption-03">기사 보기</span>
          <Icon name="chevron_right" size={16} />
        </div>
      </div>
    </button>
  );
}

function NewsRow({
  id,
  section,
  source,
  title,
  summary,
  publishedAt,
}: {
  id: number;
  section: string;
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
      className="group grid w-full cursor-pointer gap-3 border-b border-gray-50 py-6 text-left last:border-b-0 md:grid-cols-[96px_minmax(0,1fr)_120px]"
    >
      <div className="flex items-start">
        <span className="font-caption-03 text-green-700">{section}</span>
      </div>

      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-gray-400">
          <span className="font-caption-01">{source}</span>
        </div>
        <h3 className="mb-2 font-body-03 text-gray-900 transition-colors group-hover:text-green-700">
          {title}
        </h3>
        <p className="line-clamp-2 font-body-01 text-gray-500">
          {summary}
        </p>
      </div>

      <div className="flex items-end justify-between gap-4 md:flex-col md:items-end md:justify-start">
        <time className="font-caption-01 text-gray-400">{publishedAt}</time>
        <Icon
          name="chevron_right"
          size={16}
          className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
        />
      </div>
    </button>
  );
}

export default function News() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const leadNews = mockNews.find((item) => item.featured) ?? mockNews[0];
  const listItems = mockNews.filter((item) => item.id !== leadNews?.id);

  const filteredNews =
    activeTab === "ALL"
      ? listItems
      : listItems.filter((item) => item.section === activeTab);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentItems = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="layout-container py-14 md:py-16">
        <SectionHeader
          title="뉴스"
          subtitle="말리팜과 프로젝트, 탄소시장 흐름을 기사형 콘텐츠로 전해드립니다."
          className="mb-8"
        />

        {leadNews && (
          <div className="mb-10">
            <NewsLeadCard id={leadNews.id} />
          </div>
        )}

        <div className="mb-6">
          <FilterGroup
            items={[
              { text: "전체", value: "ALL" },
              { text: "서비스", value: "서비스" },
              { text: "프로젝트", value: "프로젝트" },
              { text: "탄소", value: "탄소" },
              { text: "리포트", value: "리포트" },
            ]}
            currentValue={activeTab}
            onFilterChange={handleFilterChange}
          />
        </div>

        {currentItems.length > 0 ? (
          <div>
            {currentItems.map((item) => (
              <NewsRow
                key={item.id}
                id={item.id}
                section={item.section}
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
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>
    </main>
  );
}
