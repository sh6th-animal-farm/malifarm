import React from "react";

// 상태(Variant) 타입 정의
type BadgeVariant =
  | "info" // 파랑
  | "warning" // 노랑
  | "success" // 초록
  | "default"; // 회색

interface BadgeProps {
  variant?: BadgeVariant;
  width?: number | string; // 가로 크기 (예: 61 또는 "100%")
  height?: number | string; // 세로 크기 (예: 28 또는 "2rem")
  children: React.ReactNode; // 배지 내부 텍스트
  className?: string; // 추가 스타일링용
}

export default function Badge({
  variant = "default", // 기본값은 회색
  width = 61,
  height = 28,
  children,
  className = "",
}: BadgeProps) {
  // 공통 베이스 스타일
  const baseStyles =
    "inline-flex items-center justify-center font-button-02 rounded-[var(--radius-s)] px-3 py-1";

  // 타입과 스타일을 매핑
  const variants: Record<BadgeVariant, string> = {
    info: "bg-info-light text-info",
    warning: "bg-warning-light text-warning",
    success: "bg-success-light text-success",
    default: "bg-gray-100 text-gray-600",
  };

  // 💡 인라인 스타일로 가로/세로 크기 결정
  const customStyle: React.CSSProperties = {
    width: width ?? "auto",
    height: height ?? "auto",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={customStyle}
    >
      {children}
    </div>
  );
}
