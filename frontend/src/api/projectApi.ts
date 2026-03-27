import type { ProjectData } from "@/types/projectType";
import apiClient from "./apiClient";

export const projectApi = {
    getProjectDetail: (projectId: string | number) => {
        return apiClient.get<ProjectData>(`/api/project/${projectId}`);
    },
};