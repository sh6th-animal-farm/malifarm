import EmptyState from "@/components/common/EmptyState";
import type { NewsItemDTO } from "../mockNews";
import NewsRow from "./NewsRow";

type NewsListProps = {
  items: NewsItemDTO[];
};

export default function NewsList({ items }: NewsListProps) {
  if (items.length === 0) {
    return (
      <div className="border-t-2 border-b-2 border-gray-600">
        <div className="py-24">
          <EmptyState message="표시할 뉴스가 없습니다." />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t-2 border-b-2 border-gray-600">
      {items.map((item) => (
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
  );
}
