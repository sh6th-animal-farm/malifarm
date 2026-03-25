interface TabItem {
  text: string;
  value: string;
  count?: number;
}

interface TabMenuProps {
  items: TabItem[];
  currentValue: string;
  onTabChange: (value: string) => void;
  width?: number | string; // 전체 회색 하단 보더의 길이
  className?: string;
}

export default function TabMenu({
  items,
  currentValue,
  onTabChange,
  width = "100%",
  className = "",
}: TabMenuProps) {
  return (
    <div
      className={`flex items-center gap-[24px] border-b border-gray-200 mb-[24px] ${className}`}
      style={{ width }}
    >
      {items.map((item) => {
        const isSelected = currentValue === item.value;

        return (
          <button
            key={item.value}
            onClick={() => onTabChange(item.value)}
            className={`
              relative py-3 px-2 font-subtitle-01 transition-all duration-300 cursor-pointer
              ${isSelected ? "text-green-600" : "text-gray-400 hover:text-gray-600"}
            `}
          >
            <span className="flex items-center">
              {item.text}
              {item.count !== undefined && (
                <span className="ml-1 text-gray-400 font-subtitle-01">
                  {item.count}
                </span>
              )}
            </span>

            {isSelected && (
              <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-green-600 rounded-[var(--radius-xs)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
