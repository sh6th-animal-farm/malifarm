import { useState } from 'react';
import { projectApi } from '@/api/projectApi';

type StarredProject = {
  id?: number;
  projectId?: number;
  isStarred?: boolean;
};

export const useStarreds = <T extends StarredProject>(
  initialProjects: T[] = [],
) => {
  const [projects, setProjects] = useState<T[]>(initialProjects);

  // 별(하트) 토글 핸들러
  const handleToggleStar = async (projectId: number) => {
    try {
      await projectApi.toggleStar(projectId);
      setProjects((prev) =>
        prev.map((p) => {
          const targetId = p.id || p.projectId;
          if (targetId === projectId) {
            return { ...p, isStarred: !p.isStarred } as T;
          }
          return p;
        }),
      );
    } catch (error) {
      console.error('하트 토글 실패:', error);
    }
  };

  return {
    projects,
    setProjects,
    handleToggleStar,
  };
};
