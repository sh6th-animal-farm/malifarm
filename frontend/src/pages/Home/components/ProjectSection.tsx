import ProjectCard from "@/components/common/ProjectCard";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { homeApi } from "@/api/homeApi";
import type { Project } from "@/types/projectType";
import { toCardModel } from "@/utils/projectMapper";

export default function ProjectSection() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [starredProjects, setStarredProjects] = useState<number[]>([101]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await homeApi.getMainProjects();
        setProjects(data.map(toCardModel));
      } catch (e) {
        console.error("프로젝트 목록 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleStar = (projectId: number) => {
    setStarredProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

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
          <h2 className="font-header-00 text-gray-900">
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
              starred={starredProjects.includes(project.id)}
              onToggleStar={toggleStar}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
