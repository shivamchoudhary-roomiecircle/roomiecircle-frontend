import { apiClient } from "./core";
import {
    ApiResponse,
    UploadResponseDto,
    ResourceTag,
    MediaDto,
} from "@/types/api.types";

export const requestMediaUploadUrl = async (resourceId: string, tag: ResourceTag, mediaType: string, contentType: string): Promise<UploadResponseDto> => {
    let backendMediaType = "OTHER";
    if (mediaType.toLowerCase().startsWith("image")) {
        backendMediaType = "IMAGE";
    } else if (mediaType.toLowerCase().startsWith("video")) {
        backendMediaType = "VIDEO";
    } else if (mediaType.toLowerCase().startsWith("audio")) {
        backendMediaType = "AUDIO";
    } else if (mediaType.toLowerCase().startsWith("application") || mediaType.toLowerCase().startsWith("text")) {
        backendMediaType = "DOCUMENT";
    }

    const response = await apiClient.request<ApiResponse<UploadResponseDto>>("/api/v1/media/upload-url", {
        method: "POST",
        body: JSON.stringify({
            resourceId: resourceId,
            tag,
            mediaType: backendMediaType,
            contentType,
        }),
    });
    return response.data!;
};

export const confirmMediaUpload = async (uploadId: string): Promise<MediaDto> => {
    const response = await apiClient.request<ApiResponse<MediaDto>>(`/api/v1/media/confirm/${uploadId}`, {
        method: "POST",
    });
    return response.data!;
};

export const reorderMedia = async (resourceId: string, mediaType: string, tag: string, mediaOrder: { id: number }[]): Promise<void> => {
    let backendMediaType = "OTHER";
    if (mediaType.toLowerCase().startsWith("image") || mediaType === "IMAGE") {
        backendMediaType = "IMAGE";
    } else if (mediaType.toLowerCase().startsWith("video") || mediaType === "VIDEO") {
        backendMediaType = "VIDEO";
    }

    await apiClient.request<ApiResponse<null>>("/api/v1/media/reorder", {
        method: "PUT",
        body: JSON.stringify({
            resourceId,
            mediaType: backendMediaType,
            tag,
            mediaOrder,
        }),
    });
};

export const fetchMediaForResource = async (resourceId: string, type: string, tag: string): Promise<MediaDto[]> => {
    const params = new URLSearchParams({
        type,
        tag
    });

    const response = await apiClient.request<ApiResponse<MediaDto[]>>(`/api/v1/media/resource/${resourceId}?${params.toString()}`);

    return response.data!;
};

export const deleteMedia = async (mediaId: number): Promise<void> => {
    await apiClient.request<ApiResponse<null>>(`/api/v1/media/${mediaId}`, {
        method: "DELETE",
    });
};
