import type { ReactNode, Ref } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PageShellProps {
  children: ReactNode;
  mobileOuterClassName?: string;
  mobileInnerClassName?: string;
  mobileInnerRef?: Ref<HTMLDivElement>;
}

export default function PageShell({
  children,
  mobileOuterClassName = '',
  mobileInnerClassName = '',
  mobileInnerRef,
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
        ref={mobileInnerRef}
        className={`flex min-h-0 flex-1 flex-col overflow-y-scroll overscroll-y-contain [-webkit-overflow-scrolling:touch] ${mobileInnerClassName}`}
      >
        <div className="flex min-h-full flex-col pb-px">{children}</div>
      </div>
    </div>
  );
}
