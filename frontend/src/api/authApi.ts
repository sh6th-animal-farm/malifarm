import apiClient from "./apiClient";

export const authApi = {
    getUser: () => {
        return apiClient.get("/api/user/me");
    },
    getUserName: () => {
        return apiClient.get("/api/user/me/name");
    },
    getUserRole: () => {
        return apiClient.get("/api/user/me/role");
    },
}