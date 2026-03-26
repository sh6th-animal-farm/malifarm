import ProjectCard from "@/components/common/ProjectCard";
import { useState } from "react";
import { Link } from "react-router-dom";
import { projects } from "@/pages/home/data/data";

export default function ProjectSection() {

  const [starredProjects, setStarredProjects] = useState<number[]>([101]);

  const toggleStar = (projectId: number) => {
    setStarredProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  return (
    <section className="">
      <div className="layout-container">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h2 className="font-header-01 text-gray-900">
            청약 진행 중인 프로젝트
          </h2>
          <Link
            to="/project/list"
            className="font-caption-01 text-gray-500"
          >
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
