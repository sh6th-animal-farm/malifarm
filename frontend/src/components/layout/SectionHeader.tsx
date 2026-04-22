import { type ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleSuffix?: ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  className = "",
  titleSuffix,
}: SectionHeaderProps) {
  return (
    <div className={`hidden lg:flex lg:flex-col gap-2 mb-6 ${className}`}>
      <div className="flex items-center gap-2.5">
        <h2 className="font-header-01 text-gray-900 leading-tight">{title}</h2>
        {titleSuffix}
      </div>

      {subtitle && <p className="font-body-01 text-gray-700">{subtitle}</p>}
    </div>
  );
}
