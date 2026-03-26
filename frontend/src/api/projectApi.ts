import apiClient from "./apiClient";
import type { ProjectData } from "@/types/project";

export const projectApi = {
    getProjectDetail: (projectId: string | number) => {
        return apiClient.get<ProjectData>(`/api/project/${projectId}`);
    },
};