import apiClient from './apiClient';

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
}

export const chatApi = {
  sendMessage: (payload: ChatRequest) =>
    apiClient.post<unknown, ChatResponse>('/api/chatbot/messages', payload),
};
