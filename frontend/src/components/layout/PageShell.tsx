import type { ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PageShellProps {
  children: ReactNode;
  mobileOuterClassName?: string;
  mobileInnerClassName?: string;
}

export default function PageShell({
  children,
  mobileOuterClassName = '',
  mobileInnerClassName = '',
}: PageShellProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      className={`flex h-[var(--custom-calc-height)] flex-col overflow-hidden ${mobileOuterClassName}`}
    >
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${mobileInnerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
