import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/layout/SectionHeader";
import Pagination from "@/components/common/Pagination";
import FilterGroup from "@/components/common/FilterGroup";
import EmptyState from "@/components/common/EmptyState";
import Icon from "@/components/icon";
import Badge from "@/components/common/Badge";

interface NoticeItemDTO {
  id: number;
  category: "공지" | "점검" | "이벤트" | "안내";
  title: string;
  date: string;
  isNew?: boolean;
}

const mockNotices: NoticeItemDTO[] = [
  { id: 20, category: "공지", title: "말리팜 서비스 이용약관 개정 안내", date: "2026.04.09", isNew: true },
  { id: 19, category: "점검", title: "시스템 안정화 및 정기 점검 안내 (04/12)", date: "2026.04.08", isNew: true },
  { id: 18, category: "이벤트", title: "신규 프로젝트 오픈 기념 에어드랍 이벤트", date: "2026.04.05" },
  { id: 17, category: "안내", title: "입출금 수수료 및 한도 변경 안내", date: "2026.04.02" },
  { id: 16, category: "공지", title: "보안 강화를 위한 2단계 인증 의무화 안내", date: "2026.03.28" },
  { id: 15, category: "안내", title: "고객센터 운영 시간 변경 안내", date: "2026.03.25" },
  { id: 14, category: "공지", title: "서비스 명칭 변경 안내 (말리팜)", date: "2026.03.20" },
  { id: 13, category: "이벤트", title: "친구 초대 보너스 이벤트 시즌 2", date: "2026.03.15" },
  { id: 12, category: "안내", title: "개인정보 처리방침 개정 안내", date: "2026.03.10" },
  { id: 11, category: "공지", title: "말리팜 서비스 정식 오픈 안내", date: "2026.03.01" },
  { id: 10, category: "안내", title: "설문조사 당첨자 발표 안내", date: "2026.02.25" },
  { id: 9, category: "공지", title: "화이트리스트 등록 절차 변경 안내", date: "2026.02.20" },
  { id: 8, category: "점검", title: "네트워크 업그레이드 작업 안내", date: "2026.02.15" },
  { id: 7, category: "이벤트", title: "겨울 한정 딸기 프로젝트 혜택 안내", date: "2026.02.10" },
  { id: 6, category: "안내", title: "모바일 앱 버전 업데이트 안내 (v1.2.0)", date: "2026.02.05" },
  { id: 5, category: "공지", title: "신규 제휴 파트너사 선정 안내", date: "2026.01.28" },
  { id: 4, category: "이벤트", title: "새해 맞이 포인트 2배 적립 이벤트", date: "2026.01.15" },
  { id: 3, category: "점검", title: "긴급 보안 패치 점검 안내", date: "2026.01.10" },
  { id: 2, category: "안내", title: "서비스 안정성 지표 공개", date: "2026.01.05" },
  { id: 1, category: "공지", title: "2026년 말리팜 로드맵 공유", date: "2026.01.01" },
];

function CategoryBadge({ category }: { category: NoticeItemDTO["category"] }) {
  const badgeMap: Record<string, { variant: "info" | "warning" | "success" | "default"; className: string }> = {
    공지: { variant: "default", className: "!bg-transparent !text-gray-700" },
    점검: { variant: "default", className: "!bg-transparent !text-gray-500" },
    이벤트: { variant: "default", className: "!bg-transparent !text-gray-500" },
    안내: { variant: "default", className: "!bg-transparent !text-gray-500" },
  };

  const { variant, className } = badgeMap[category];

  return (
    <Badge
      variant={variant}
      className={`!h-auto !min-w-0 !w-auto !border-0 !bg-transparent !px-0 !py-0 font-caption-02 ${className}`}
    >
      {category}
    </Badge>
  );
}

function NoticeRow({ notice }: { notice: NoticeItemDTO }) {
  const navigate = useNavigate();

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 border-b border-gray-50 px-4 py-5 transition-colors last:border-b-0 hover:bg-gray-50 md:gap-6 md:px-5 md:py-6"
      onClick={() => navigate(`/notice/${notice.id}`)}
    >
      <div className="flex w-10 shrink-0 justify-start md:w-12">
        <CategoryBadge category={notice.category} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h3 className="truncate font-body-02 text-gray-900 transition-colors group-hover:text-green-700">
          {notice.title}
        </h3>
        {notice.isNew && (
          <span className="shrink-0 font-caption-03 text-green-700">
            NEW
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <time className="hidden font-caption-01 text-gray-400 md:block">
          {notice.date}
        </time>
        <Icon
          name="chevron_right"
          size={16}
          className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
        />
      </div>
    </div>
  );
}

export default function Notice() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredNotices =
    activeTab === "ALL"
      ? mockNotices
      : mockNotices.filter((n) => n.category === activeTab);

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const currentItems = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="layout-container py-14 md:py-16">
        <SectionHeader
          title="공지사항"
          subtitle="서비스의 새로운 소식과 점검 안내를 전해드립니다."
          className="mb-7"
        />

        <div className="mb-6">
          <FilterGroup
            items={[
              { text: "전체", value: "ALL" },
              { text: "공지", value: "공지" },
              { text: "점검", value: "점검" },
              { text: "이벤트", value: "이벤트" },
              { text: "안내", value: "안내" },
            ]}
            currentValue={activeTab}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="bg-white">
          {currentItems.length > 0 ? (
            <div className="flex flex-col">
              {currentItems.map((notice) => (
                <NoticeRow key={notice.id} notice={notice} />
              ))}
            </div>
          ) : (
            <div className="py-24">
              <EmptyState message="검색된 결과가 없습니다." />
            </div>
          )}
        </div>

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
    </div>
  );
}
