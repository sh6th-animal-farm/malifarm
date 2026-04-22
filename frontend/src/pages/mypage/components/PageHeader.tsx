import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
}

export default function PageHeader({ title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <div className="mb-6 hidden flex-col gap-3 lg:mb-8 lg:flex lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <h1 className="font-header-01 text-gray-900">{title}</h1>
        <p className="mt-1.5 font-body-01 text-gray-500">{subtitle}</p>
      </div>
      {rightSlot ? <div className="self-start lg:self-auto">{rightSlot}</div> : null}
    </div>
  );
}
