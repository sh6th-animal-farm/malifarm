import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
}

export default function PageHeader({ title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <h1 className="font-header-01 text-gray-900">{title}</h1>
        <p className="mt-1.5 font-body-01 text-gray-500">{subtitle}</p>
      </div>
      {rightSlot ? <div className="self-start md:self-auto">{rightSlot}</div> : null}
    </div>
  );
}
