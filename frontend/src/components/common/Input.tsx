import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={`w-full h-[50px] px-4 border border-gray-200 rounded-[var(--radius-s)] text-[15px] text-gray-900 bg-white transition-colors focus:outline-none focus:border-green-600 ${className}`}
    />
  );
}