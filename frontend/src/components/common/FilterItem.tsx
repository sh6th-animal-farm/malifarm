import React from "react";

type FilterVariant = "selected" | "default";

interface FilterItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FilterVariant;
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
}

export default function FilterItem({
  variant = "default",
  width = 72,
  height = 36,
  children,
  className = "",
  ...props
}: FilterItemProps) {
  // 공통 베이스 스타일
  const baseStyles =
    "inline-flex items-center justify-center font-button-02 transition-all duration-200 rounded-[var(--radius-s)] border-none whitespace-nowrap cursor-pointer px-3 py-2";

  const variants: Record<FilterVariant, string> = {
    default:
      "bg-transparent text-gray-700 hover:bg-success-light hover:text-success",
    selected: "bg-green-600 text-white",
  };

  const customStyle: React.CSSProperties = {
    width: width ?? "auto",
    height: height ?? "auto",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={customStyle}
      {...props}
    >
      {children}
    </button>
  );
}
