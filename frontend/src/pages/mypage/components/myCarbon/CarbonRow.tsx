import Tag from "@/components/common/Badge";
import type { CarbonHistoryDTO } from "@/types/myPageType";
import { formatTco2e, formatWon, normalizeDate, typeBadge } from "./carbonFormatters";

interface CarbonRowProps {
  item: CarbonHistoryDTO;
}

export default function CarbonRow({ item }: CarbonRowProps) {
  const badge = typeBadge(item.cpType, item.endDateStr);

  return (
    <div
      className="grid grid-cols-[1fr_1.8fr_1fr_1fr_0.8fr_1.2fr] items-center gap-2 border-t border-gray-100 px-4 py-5 font-body-01 text-gray-800 lg:grid-cols-[0.8fr_2fr_1fr_1fr_0.8fr_1.2fr] lg:pr-6 lg:pl-0"
    >
      <div className="flex justify-center">
        <Tag variant={badge.variant} width="auto">
          {badge.label}
        </Tag>
      </div>
      <p className="font-body-02 text-gray-900">{item.projectName}</p>
      <p className="text-center font-body-02 text-gray-900">{normalizeDate(item.dateStr)}</p>
      <p className="text-center font-body-02 text-gray-900">{normalizeDate(item.endDateStr)}</p>
      <p className="text-right font-body-02 text-gray-900">{formatTco2e(item.amount)}</p>
      <p className="text-right font-body-02 text-gray-900">{formatWon(item.price)}</p>
    </div>
  );
}
