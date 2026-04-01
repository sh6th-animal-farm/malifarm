import ProjectCard from '@/components/common/ProjectCard';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeApi } from '@/api/homeApi';
import { toCardModel } from '@/utils/projectMapper';
import { useStarreds } from '@/pages/project/hook/useStarreds';

export default function ProjectSection() {
  const [loading, setLoading] = useState(true);
  const { projects, setProjects, handleToggleStar } = useStarreds([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await homeApi.getMainProjects();
        console.log('메인 프로젝트 데이터:', data);
        setProjects(data.map(toCardModel));
      } catch (e) {
        console.error('프로젝트 목록 로드 실패', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading)
    return (
      <section>
        <div className="layout-container">로딩중...</div>
      </section>
    );

  return (
    <section className="py-14 md:py-20 lg:py-24">
      <div className="layout-container">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h2 className="font-header-01 text-gray-900">
            청약 진행 중인 프로젝트
          </h2>
          <Link to="/project/list" className="font-caption-01 text-gray-500">
            전체보기 &gt;
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              starred={project.isStarred}
              onToggleStar={handleToggleStar}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
