import React from "react";

// 스타일 타입 정의
type ButtonVariant =
  | "default" // 검정 / 초록(hover)
  | "default-warning" // 검정 / 노랑 (hover)
  | "default-info" // 검정 / 파랑 (hover)
  | "disabled" // 회색 (disabled)
  | "outline-default" // 초록 테두리
  | "outline-disabled" // 회색 테두리
  | "check"; // 초록 / 진한 초록 (hover)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  width?: number | string; // 가로 크기 (예: 200 또는 "100%")
  height?: number | string; // 세로 크기 (예: 48 또는 "3rem")
  children: React.ReactNode; // 버튼 내부 텍스트
}

export default function Button({
  variant = "default",
  width = 400,
  height = 56,
  children = "버튼",
  className = "",
  ...props
}: ButtonProps) {
  // 공통 스타일
  const baseStyles =
    "inline-flex items-center justify-center font-button-01 transition-all duration-200 rounded-[var(--radius-s)] border overflow-hidden whitespace-nowrap";

  // 버튼 타입별 스타일 매핑
  const variants: Record<ButtonVariant, string> = {
    default:
      "bg-gray-900 border-gray-900 text-white hover:bg-green-600 hover:border-green-600",
    "default-warning":
      "bg-gray-900 border-gray-900 text-white hover:bg-green-600 hover:border-green-600",
    "default-info":
      "bg-gray-900 border-gray-900 text-white hover:bg-green-600 hover:border-green-600",
    disabled:
      "bg-gray-500 border-gray-500 text-white cursor-not-allowed opacity-70",
    "outline-default":
      "bg-white border-green-600 text-green-600 hover:bg-green-50",
    "outline-disabled":
      "bg-white border-gray-300 text-gray-300 cursor-not-allowed",
    check:
      "bg-green-600 border-green-600 text-white hover:bg-green-800 hover:border-green-700",
  };

  // 💡 인라인 스타일로 가로/세로 크기 결정
  const customStyle: React.CSSProperties = {
    width: width ?? "auto",
    height: height ?? "auto",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={customStyle}
      disabled={variant.includes("disabled")}
      {...props}
    >
      {children}
    </button>
  );
}
