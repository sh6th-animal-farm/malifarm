import type { ProjectData } from "@/types/projectType";
import apiClient from "./apiClient";

export const projectApi = {
    getProjectDetail: (projectId: string | number) => {
        return apiClient.get<ProjectData>(`/api/project/${projectId}`);
    },
    getCheckAccount: (userId: string | number | undefined) => {
        return apiClient.get(`/api/project/checkAccount`, {
            params: { userId }
        });
    },
    getMyWalletInfo: (userId: string | number | undefined) => {
        return apiClient.get(`/api/project/walletInfo`, {
            params: { userId }
        });
    }
};