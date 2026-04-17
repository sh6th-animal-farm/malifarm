import EmptyState from "@/components/common/EmptyState";
import type { NewsListItem } from "@/types/newsType";
import NewsRow from "./NewsRow";

type NewsListProps = {
  items: NewsListItem[];
};

export default function NewsList({ items }: NewsListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        message="표시할 뉴스가 없습니다."
        className="mb-0 min-h-[260px] md:min-h-[420px]"
      />
    );
  }

  return (
    <div className="border-t-2 border-b-2 border-gray-600">
      {items.map((item) => (
        <NewsRow
          key={item.id}
          id={item.id}
          hourLabel={item.hourLabel}
          source={item.source}
          title={item.title}
          summary={item.summary}
          publishedAt={item.publishedAt}
        />
      ))}
    </div>
  );
}
