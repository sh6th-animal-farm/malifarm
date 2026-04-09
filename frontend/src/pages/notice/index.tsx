import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import SectionHeader from "@/components/layout/SectionHeader";

export default function Notice() {
  return (
    <section className="layout-container py-15 md:py-20">
      <SectionHeader
        title="공지사항"
        subtitle="마이리틀 스마트팜의 새로운 소식과 투자 정보를 전해드립니다."
        className="mb-8 md:mb-10"
      />

      <EmptyState message="등록된 공지사항이 없습니다." />

      <Pagination currentPage={1} totalPages={1} />
    </section>
  );
}
