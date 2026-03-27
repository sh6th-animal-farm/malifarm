import type { ProjectDTO, Token } from "@/types/projectType";
import apiClient from "./apiClient";

export const homeApi = {
  getMainProjects: () => apiClient.get<ProjectDTO[], ProjectDTO[]>("/api/home/project"),
  getMainTokens: () => apiClient.get<Token[], Token[]>("/api/home/token"),
};
