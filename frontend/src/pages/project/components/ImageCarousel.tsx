import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/icon';

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({
  images,
}: ImageCarouselProps) {
  const total = images.length;
  const hasLoop = total > 1;

  const [currentIdx, setCurrentIdx] = useState(0);

  const [mainTrackIdx, setMainTrackIdx] = useState(1);
  const [isMainAnimating, setIsMainAnimating] = useState(true);
  const mainResettingRef = useRef(false);
  const mainResetRafRef = useRef<number | null>(null);

  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullTrackIdx, setFullTrackIdx] = useState(1);
  const [isFullAnimating, setIsFullAnimating] = useState(true);
  const fullResettingRef = useRef(false);
  const fullResetRafRef = useRef<number | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const loopedImages = hasLoop ? [images[total - 1], ...images, images[0]] : images;

  const normalizeIdx = (idx: number) => (idx + total) % total;

  const moveMain = (step: number) => {
    if (!hasLoop) return;
    setIsMainAnimating(true);
    setMainTrackIdx((prev) => prev + step);
    setCurrentIdx((prev) => normalizeIdx(prev + step));
  };

  const moveFull = (step: number) => {
    if (!hasLoop) return;
    setIsFullAnimating(true);
    setFullTrackIdx((prev) => prev + step);
    setCurrentIdx((prev) => normalizeIdx(prev + step));
  };

  const jumpMain = (index: number) => {
    setCurrentIdx(index);
    setIsMainAnimating(true);
    setMainTrackIdx(index + 1);
  };

  useEffect(() => {
    setCurrentIdx(0);
    setMainTrackIdx(1);
    setIsMainAnimating(true);
    setFullTrackIdx(1);
    setIsFullAnimating(true);
  }, [images]);

  useEffect(() => {
    if (!isFullscreenOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.innerWidth >= 1024 && e.key === 'Escape') {
        setIsFullscreenOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen]);

  useEffect(() => {
    if (!isFullscreenOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isFullscreenOpen]);

  useEffect(() => {
    if (isFullscreenOpen) {
      setIsFullAnimating(false);
      setFullTrackIdx(currentIdx + 1);
      fullResetRafRef.current = window.requestAnimationFrame(() => {
        setIsFullAnimating(true);
      });
      return;
    }

    setIsMainAnimating(false);
    setMainTrackIdx(currentIdx + 1);
    mainResetRafRef.current = window.requestAnimationFrame(() => {
      setIsMainAnimating(true);
    });
  }, [isFullscreenOpen]);

  useEffect(() => {
    return () => {
      if (mainResetRafRef.current) window.cancelAnimationFrame(mainResetRafRef.current);
      if (fullResetRafRef.current) window.cancelAnimationFrame(fullResetRafRef.current);
    };
  }, []);

  const handleMainTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !hasLoop || mainResettingRef.current) return;

    if (mainTrackIdx === 0) {
      mainResettingRef.current = true;
      setIsMainAnimating(false);
      setMainTrackIdx(total);
      mainResetRafRef.current = window.requestAnimationFrame(() => {
        mainResetRafRef.current = window.requestAnimationFrame(() => {
          setIsMainAnimating(true);
          mainResettingRef.current = false;
        });
      });
      return;
    }

    if (mainTrackIdx === total + 1) {
      mainResettingRef.current = true;
      setIsMainAnimating(false);
      setMainTrackIdx(1);
      mainResetRafRef.current = window.requestAnimationFrame(() => {
        mainResetRafRef.current = window.requestAnimationFrame(() => {
          setIsMainAnimating(true);
          mainResettingRef.current = false;
        });
      });
    }
  };

  const handleFullTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !hasLoop || fullResettingRef.current) return;

    if (fullTrackIdx === 0) {
      fullResettingRef.current = true;
      setIsFullAnimating(false);
      setFullTrackIdx(total);
      fullResetRafRef.current = window.requestAnimationFrame(() => {
        fullResetRafRef.current = window.requestAnimationFrame(() => {
          setIsFullAnimating(true);
          fullResettingRef.current = false;
        });
      });
      return;
    }

    if (fullTrackIdx === total + 1) {
      fullResettingRef.current = true;
      setIsFullAnimating(false);
      setFullTrackIdx(1);
      fullResetRafRef.current = window.requestAnimationFrame(() => {
        fullResetRafRef.current = window.requestAnimationFrame(() => {
          setIsFullAnimating(true);
          fullResettingRef.current = false;
        });
      });
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>,
    moveFn: (step: number) => void,
    swipeDownClose = false,
  ) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (swipeDownClose && window.innerWidth < 1024 && deltaY > 90 && Math.abs(deltaY) > Math.abs(deltaX)) {
      setIsFullscreenOpen(false);
      touchStartRef.current = null;
      return;
    }

    if (hasLoop && Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      moveFn(deltaX > 0 ? -1 : 1);
    }

    touchStartRef.current = null;
  };

  if (!images || total === 0) {
    return <div className="w-full aspect-[16/9] rounded-none bg-gray-50 md:rounded-lg" />;
  }

  const overlay = isFullscreenOpen ? (
    <div className="fixed inset-0 z-[10000] bg-black">
      <div className="absolute left-1/2 top-4 z-10 inline-flex h-10 -translate-x-1/2 items-center rounded-full bg-black/45 px-3 text-base text-white">
        {currentIdx + 1} / {total}
      </div>

      <button
        type="button"
        className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center text-white transition-colors duration-200 lg:cursor-pointer lg:hover:bg-white/15"
        onClick={() => setIsFullscreenOpen(false)}
        aria-label="전체화면 닫기"
      >
        <Icon name="close" size={24} color="currentColor" />
      </button>

      <div
        className="h-full w-full overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={(e) => onTouchEnd(e, moveFull, true)}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${fullTrackIdx * 100}%)`,
            transition: isFullAnimating ? 'transform 300ms ease-out' : 'none',
          }}
          onTransitionEnd={handleFullTransitionEnd}
        >
          {loopedImages.map((img, i) => (
            <div key={`fullscreen-${i}`} className="flex h-full min-w-full items-center justify-center">
              <img
                src={img}
                className="h-full w-full object-contain lg:h-auto lg:w-auto lg:max-h-[82vh] lg:max-w-[82vw]"
                alt={`project-full-${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {hasLoop && (
        <>
          <button
            type="button"
            onClick={() => moveFull(-1)}
            className="absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors duration-200 lg:inline-flex lg:cursor-pointer lg:hover:bg-white/15"
            aria-label="이전 이미지"
          >
            <Icon name="chevron_right" size={24} color="currentColor" className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => moveFull(1)}
            className="absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors duration-200 lg:inline-flex lg:cursor-pointer lg:hover:bg-white/15"
            aria-label="다음 이미지"
          >
            <Icon name="chevron_right" size={24} color="currentColor" />
          </button>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="relative overflow-hidden">
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-none bg-gray-50 md:rounded-lg">
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${mainTrackIdx * 100}%)`,
            transition: isMainAnimating ? 'transform 500ms ease-in-out' : 'none',
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => onTouchEnd(e, moveMain)}
          onTransitionEnd={handleMainTransitionEnd}
        >
          {loopedImages.map((img, i) => (
            <div key={i} className="flex h-full min-w-full items-center justify-center">
              <button
                type="button"
                className="block h-full w-full"
                onClick={() => setIsFullscreenOpen(true)}
                aria-label={`이미지 ${i + 1} 확대 보기`}
              >
                <img src={img} className="h-full w-full object-cover" alt={`project-${i + 1}`} />
              </button>
            </div>
          ))}
        </div>

        {hasLoop && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:hidden">
            {images.map((_, i) => (
              <button
                key={`mobile-dot-${i}`}
                onClick={() => jumpMain(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIdx === i ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`${i + 1}번 이미지로 이동`}
              />
            ))}
          </div>
        )}
      </div>

      {hasLoop && (
        <div className="mt-6 hidden items-center justify-center gap-3 lg:flex">
          <button
            onClick={() => moveMain(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-gray-50"
            aria-label="이전 이미지"
          >
            <Icon name="chevron_right" size={20} color="currentColor" className="rotate-180" />
          </button>
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpMain(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIdx === i ? 'w-6 bg-green-600' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => moveMain(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-gray-50"
            aria-label="다음 이미지"
          >
            <Icon name="chevron_right" size={20} color="currentColor" />
          </button>
        </div>
      )}

      {typeof document !== 'undefined' ? createPortal(overlay, document.body) : null}
    </div>
  );
}
