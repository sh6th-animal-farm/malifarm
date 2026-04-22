import ProjectCard from '@/components/common/ProjectCard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeApi } from '@/api/homeApi';
import type { Project } from '@/types/projectType';
import { toCardModel } from '@/utils/projectMapper';
import { useStarreds } from '@/pages/project/hook/useStarreds';
import Icon from '@/components/icon';

export default function ProjectSection() {
  const { projects, setProjects, handleToggleStar } = useStarreds<Project>([]);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(false);

  const updateSlideAvailability = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    setCanSlidePrev(slider.scrollLeft > 2);
    setCanSlideNext(slider.scrollLeft < maxScrollLeft - 2);
  }, []);

  const slideByViewport = (direction: 'prev' | 'next') => {
    const slider = sliderRef.current;
    if (!slider) return;

    const amount = slider.clientWidth * 0.9;
    slider.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await homeApi.getMainProjects();
        setProjects(data.map(toCardModel));
      } catch (e) {
        console.error('프로젝트 목록 로드 실패', e);
      }
    };

    fetchProjects();
  }, [setProjects]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onScroll = () => updateSlideAvailability();
    const onResize = () => updateSlideAvailability();

    updateSlideAvailability();
    slider.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      slider.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [projects.length, updateSlideAvailability]);

  return (
    <section className="py-14 md:py-20 lg:py-24">
      <div className="layout-container">
        <div className="flex items-start justify-between gap-4 flex-row items-end">
          <h2 className="font-header-01 text-gray-900 mb-7 lg:mb-0">주목할 만한 프로젝트</h2>
          <Link
            to="/project"
            className="inline-flex items-center rounded-full px-3 py-1 font-caption-01 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            전체보기 &gt;
          </Link>
        </div>

        <div>
          <div
            ref={sliderRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto lg:py-8 md:gap-6 [scroll-padding-inline:1rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="min-w-0 shrink-0 basis-[92%] snap-start sm:basis-[72%] md:basis-[calc(50%-12px)] lg:basis-[calc((100%-48px)/3)]"
              >
                <ProjectCard
                  project={project}
                  starred={project.isStarred ?? false}
                  onToggleStar={handleToggleStar}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => slideByViewport('prev')}
            disabled={!canSlidePrev}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="이전 프로젝트 보기"
          >
            <Icon name="chevron_right" size={18} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => slideByViewport('next')}
            disabled={!canSlideNext}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="다음 프로젝트 보기"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
