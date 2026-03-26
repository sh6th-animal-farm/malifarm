import FilterItem from "./FilterItem";

interface FilterItemInfo {
  text: string; // 필터 내부 텍스트
  value: string; // 필터의 고유 값
}

interface FilterGroupProps {
  items: FilterItemInfo[];
  currentValue: string; // 현재 선택된 필터의 고유 값
  onFilterChange: (value: string) => void;
}

export default function FilterGroup({
  items,
  currentValue,
  onFilterChange,
}: FilterGroupProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {items.map((item) => {
        const isSelected = currentValue === item.value;

        return (
          <FilterItem
            key={item.value}
            variant={isSelected ? "selected" : "default"}
            onClick={() => onFilterChange(item.value)}
          >
            {item.text}
          </FilterItem>
        );
      })}
    </div>
  );
}
