import { useEffect, useRef, useState } from "react";

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
  tabPaddingY?: number | string;
  gap?: number | string;
  marginY?: number | string;
  equalWidth?: boolean;
}

export default function TabMenu({
  items,
  currentValue,
  onTabChange,
  width = "100%",
  className = "",
  tabPaddingY = 8,
  gap = 24,
  marginY = 24,
  equalWidth = false,
}: TabMenuProps) {
  const toCssSize = (value: number | string) =>
    typeof value === "number" ? `${value}px` : value;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const updateIndicator = () => {
      const container = containerRef.current;
      const activeButton = buttonRefs.current[currentValue];
      if (!container || !activeButton) return;

      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        ready: true,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [currentValue, items.length, gap, marginY, tabPaddingY, equalWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center border-b border-gray-200 ${className}`}
      style={{
        width,
        gap: toCssSize(gap),
        marginTop: toCssSize(marginY),
        marginBottom: toCssSize(marginY),
      }}
    >
      {items.map((item) => {
        const isSelected = currentValue === item.value;

        return (
          <button
            key={item.value}
            ref={(el) => {
              buttonRefs.current[item.value] = el;
            }}
            onClick={() => onTabChange(item.value)}
            className={`
              relative px-2 font-subtitle-01 transition-all duration-300 cursor-pointer
              ${equalWidth ? "flex-1 min-w-0 text-center" : ""}
              ${isSelected ? "text-green-600" : "text-gray-400 hover:text-gray-600"}
            `}
            style={{ paddingTop: tabPaddingY, paddingBottom: tabPaddingY }}
          >
            <span className={`flex items-center ${equalWidth ? "justify-center" : ""}`}>
              {item.text}
              {item.count !== undefined && (
                <span className="ml-1 text-gray-400 font-subtitle-01">
                  {item.count}
                </span>
              )}
            </span>
          </button>
        );
      })}

      <div
        className="absolute bottom-[-2px] h-[3px] rounded-[var(--radius-xs)] bg-green-600 transition-all duration-200 ease-out"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          opacity: indicator.ready ? 1 : 0,
        }}
      />
    </div>
  );
}
