import type { MyPageProjectDTO } from "@/types/myPageType";
import ProjectRow from "./ProjectRow";

interface ProjectTableProps {
  loading: boolean;
  projects: MyPageProjectDTO[];
  onMove: (projectId: number) => void;
}

export default function ProjectTable({ loading, projects, onMove }: ProjectTableProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-std">
      <div>
        {loading ? (
          <div className="flex min-h-40 items-center justify-center px-4 py-4 text-center font-body-01 text-gray-400 md:px-6">
            불러오는 중...
          </div>
        ) : projects.length > 0 ? (
          projects.map((project, index) => (
            <ProjectRow
              key={`${project.projectId}-${project.projectName}`}
              project={project}
              index={index}
              totalCount={projects.length}
              onMove={onMove}
            />
          ))
        ) : (
          <div className="flex min-h-40 items-center justify-center px-4 py-4 text-center font-body-01 text-gray-400 md:px-6">
            프로젝트 내역이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}
