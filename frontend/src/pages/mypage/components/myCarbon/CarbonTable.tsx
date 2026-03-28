import type { CarbonHistoryDTO } from "@/types/myPageType";
import CarbonRow from "./CarbonRow";

interface CarbonTableProps {
  loading: boolean;
  items: CarbonHistoryDTO[];
}

export default function CarbonTable({ loading, items }: CarbonTableProps) {
  return (
    <section className="rounded-lg bg-white shadow-std">
      <div className="overflow-x-auto">
        <div className="min-w-max lg:min-w-full">
          <div className="grid grid-cols-[1fr_1.8fr_1fr_1fr_0.8fr_1.2fr] gap-2 bg-gray-50 px-4 py-3 font-body-02 text-gray-500 lg:grid-cols-[0.8fr_2fr_1fr_1fr_0.8fr_1.2fr] lg:pr-6 lg:pl-0 lg:py-4">
            <span className="text-center">구분</span>
            <span>프로젝트 정보</span>
            <span className="text-center">구매일</span>
            <span className="text-center">만료일</span>
            <span className="text-right">구매량</span>
            <span className="text-right">구매 금액</span>
          </div>

          {!loading && items.length > 0 ? (
            <div>
              {items.map((item, index) => (
                <CarbonRow
                  key={`${item.projectName}-${item.dateStr}-${index}`}
                  item={item}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center font-body-01 text-gray-400 md:py-20">
              {loading ? "불러오는 중..." : "구매하신 탄소 배출권 내역이 없습니다."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
