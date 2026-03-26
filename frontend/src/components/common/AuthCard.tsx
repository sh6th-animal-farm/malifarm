import React from "react";

type AuthCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-[520px]">
      <div className="bg-white p-10 rounded-[var(--radius-l)] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        
        <h2 className="text-center text-[24px] leading-[1.4] font-bold text-gray-900 mb-3">
          {title}
        </h2>

        {description && (
          <p className="text-center text-[14px] leading-[1.5] text-gray-500 mb-8">
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}