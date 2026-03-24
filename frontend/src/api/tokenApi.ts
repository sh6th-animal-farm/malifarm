import type { Token } from "../types/tokenType";
import apiClient from "./apiClient";

export const tokenApi = {
    getTokenInfo: (tokenId: number) => {
        return apiClient.get<Token>(`/api/token/${tokenId}`);
    },
}