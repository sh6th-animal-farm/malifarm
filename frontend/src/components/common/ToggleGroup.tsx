interface ToggleItem {
  id: string;
  label: string;
}

interface ToggleGroupProps {
  tabs: ToggleItem[];
  activeTab: string; // 현재 활성화된 탭 ID
  onChange: (id: string) => void;
  width?: number;
  height?: number;
}

export default function ToggleGroup({
  tabs,
  activeTab,
  onChange,
  width = 372,
  height = 52,
}: ToggleGroupProps) {
  return (
    <div
      className="flex bg-gray-100 rounded-[var(--radius-s)] p-1.5 shrink-0"
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 border-none rounded-[var(--radius-s)] cursor-pointer transition-all duration-100
            font-caption-02 text-gray-400 bg-transparent
            ${
              activeTab === tab.id
                ? 'bg-white font-caption-03 text-green-600 shadow-std'
                : 'hover:text-gray-600'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
