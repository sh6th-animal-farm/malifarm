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
  fullWidth?: boolean;
}

export default function ToggleGroup({
  tabs,
  activeTab,
  onChange,
  width = 372,
  height = 52,
  fullWidth = false,
}: ToggleGroupProps) {
  return (
    <div
      className="flex bg-gray-100 rounded-[var(--radius-s)] p-1 shrink-0"
      style={{
        height: `${height}px`,
        width: fullWidth ? '100%' : `${width}px`,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 rounded-[var(--radius-s)] cursor-pointer transition-all duration-100
            font-caption-02 text-gray-400 bg-transparent
            ${
              activeTab === tab.id
                ? 'bg-white font-caption-03 text-green-600'
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
