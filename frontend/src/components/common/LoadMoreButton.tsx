import type { ButtonHTMLAttributes, ReactNode } from "react";

interface LoadMoreButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export default function LoadMoreButton({
  children = "+ 더보기",
  className = "",
  ...props
}: LoadMoreButtonProps) {
  return (
    <button
      type="button"
      className={`mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-white font-button-01 text-gray-600 shadow-std transition-colors cursor-pointer hover:bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
