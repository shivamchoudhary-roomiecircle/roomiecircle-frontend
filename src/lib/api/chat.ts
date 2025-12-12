import { apiClient } from "./core";
import { InboxItem, Message, CreateThreadRequest, SendMessageRequest, ReadReceiptRequest } from "../../types/chat";
import { ApiResponse, PagedResponse } from "../../types/api.types";

export const chatApi = {
    getInbox: async () => {
        const response = await apiClient.request<ApiResponse<InboxItem[]>>("/api/v1/threads");
        return response.data || [];
    },

    getMessages: async (threadId: number, page: number = 0, size: number = 20) => {
        const response = await apiClient.request<ApiResponse<PagedResponse<Message>>>(`/api/v1/messages?threadId=${threadId}&page=${page}&size=${size}`);
        return response.data;
    },

    createThread: async (data: CreateThreadRequest) => {
        const response = await apiClient.request<ApiResponse<{ id: number; resourceType: string; resourceId: number; lastMessageAt: string }>>(
            "/api/v1/chat/threads",
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        return response.data!;
    },

    sendMessageRest: async (data: SendMessageRequest) => {
        const response = await apiClient.request<ApiResponse<Message>>("/api/v1/chat/messages", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response.data!;
    },

    markRead: async (data: ReadReceiptRequest) => {
        const response = await apiClient.request<ApiResponse<void>>("/api/v1/chat/read", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response.data; // might be undefined/null which is fine for void
    },
};
