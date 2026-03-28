import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-2 mb-6 ${className}`}>
      <h2 className="font-header-01 text-gray-900 leading-tight">{title}</h2>

      {subtitle && <p className="font-body-01 text-gray-700">{subtitle}</p>}
    </div>
  );
}
