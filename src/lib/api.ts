import JSONbig from "json-bigint";
import {
  ApiResponse,
  // Auth types
  SignupInitiateResponse,
  AuthResponse,
  UserInfo,
  RefreshTokenResponse,
  ResendVerificationResponse,
  OtpLoginInitiateResponse,
  // User types
  UserProfileDTO,
  UploadProfilePhotoResponse,
  DeleteAccountResponse,
  // Room types
  RoomListingDTO,
  MyRoomsResponse,
  DeleteRoomResponse,
  // Search types
  RoomSearchResultDTO,
  RoomListingDetailDTO,
  // Places types
  PlaceAutocompleteResponse,
  PlaceSuggestionDTO,
  PlaceDetailsDTO,
  // Media types
  UploadResponseDto,
  MediaDto,
  MediaListResponse,
  MediaMutationResponse,
  MediaLinkDTO,
  MediaType,
  MediaStatus,
  ResourceTag,
  // Config types
  ClientConfigResponse,
  // Shared types
  PagedResponse,
} from "@/types/api.types";

const API_BASE_URL = "https://staging-api.roomiecircle.com";

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;
    console.log(`[API] Starting request to ${API_BASE_URL}${endpoint}`, fetchOptions);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(skipAuth ? {} : this.getAuthHeader()),
        ...fetchOptions.headers,
      },
    });
    console.log(`[API] Response from ${endpoint}:`, response.status, response.statusText);

    // Parse response using json-bigint to handle large numbers (like Snowflake IDs)
    const text = await response.text();
    const responseData = text ? JSONbig({ storeAsString: true }).parse(text) : null;

    // Check for TOKEN_EXPIRED error in response
    if (responseData && responseData.success === false && responseData.error === "TOKEN_EXPIRED") {
      // Clear auth tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Store message for login page to display
      sessionStorage.setItem("tokenExpiredMessage", responseData.message || "Your session has expired. Please login again to continue.");
      // Redirect to login
      window.location.href = "/auth/login";
      throw new Error(responseData.message || "Token expired");
    }

    if (response.status === 401) {
      // For login/auth endpoints (skipAuth: true), extract error message from response
      if (skipAuth && responseData) {
        const errorMessage = responseData.message || "Authentication failed";
        throw new Error(errorMessage);
      }

      // For other endpoints, try to refresh token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the request
        return this.request(endpoint, options);
      } else {
        // Clear auth and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        const errorMessage = responseData?.message || "Authentication failed";
        window.location.href = "/auth/login";
        throw new Error(errorMessage);
      }
    }

    if (!response.ok) {
      const error = responseData || { message: "Request failed" };
      throw new Error(error.message || "Request failed");
    }

    return responseData;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const accessToken = data.accessToken || data.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async initiateSignup(email: string, password: string, name: string): Promise<SignupInitiateResponse> {
    const response = await this.request<ApiResponse<SignupInitiateResponse>>("/api/v1/auth/signup/initiate-verification", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
    return response.data;
  }

  async verifySignup(tempId: string, code: string): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>("/api/v1/auth/signup/verify", {
      method: "POST",
      body: JSON.stringify({ tempId, code }),
      skipAuth: true,
    });
    return response.data!;
  }

  async resendVerification(tempId: string): Promise<ResendVerificationResponse> {
    const response = await this.request<ApiResponse<ResendVerificationResponse>>("/api/v1/auth/signup/resend-verification", {
      method: "POST",
      body: JSON.stringify({ tempId }),
      skipAuth: true,
    });
    return response.data!;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    return response.data!;
  }

  async initiateOtpLogin(email: string): Promise<OtpLoginInitiateResponse> {
    const response = await this.request<ApiResponse<OtpLoginInitiateResponse>>("/api/v1/auth/login/otp/initiate", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
    return response.data!;
  }

  async verifyOtpLogin(tempId: string, code: string): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>("/api/v1/auth/login/otp/verify", {
      method: "POST",
      body: JSON.stringify({ tempId, code }),
      skipAuth: true,
    });
    return response.data!;
  }

  async googleSignup(idToken: string): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    });
    return response.data!;
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    });
    return response.data!;
  }

  async deleteAccount(): Promise<void> {
    await this.request<ApiResponse<null>>("/api/v1/users/me", {
      method: "DELETE",
    });
  }



  // Search endpoints
  async searchPlacesStartingWith(prefix: string, sessionToken?: string): Promise<PlaceSuggestionDTO[]> {
    const params = new URLSearchParams({ "input": prefix });
    if (sessionToken) params.append("sessionToken", sessionToken);

    const response = await this.request<ApiResponse<PlaceAutocompleteResponse>>(`/api/v1/places/autocomplete?${params.toString()}`, {
      skipAuth: true,
    });
    return response.data!.suggestions;
  }

  async searchRoomsAroundPlace(placeId: string, filters: {
    radiusKm?: number;
    rentMin?: number;
    rentMax?: number;
    propertyType?: string[];
    roomType?: string[];
    bhkType?: string[];
    amenities?: string[];
    page?: number;
    size?: number;
  }): Promise<PagedResponse<RoomSearchResultDTO>> {
    const params = new URLSearchParams({
      placeId,
      page: (filters.page || 0).toString(),
      size: (filters.size || 10).toString(),
    });

    if (filters.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
    if (filters.rentMin) params.append('rentMin', filters.rentMin.toString());
    if (filters.rentMax) params.append('rentMax', filters.rentMax.toString());

    if (filters.propertyType?.length) {
      filters.propertyType.forEach(type => params.append('propertyType', type));
    }
    if (filters.roomType?.length) {
      filters.roomType.forEach(type => params.append('roomType', type));
    }
    if (filters.bhkType?.length) {
      filters.bhkType.forEach(type => params.append('bhkType', type));
    }
    if (filters.amenities?.length) {
      filters.amenities.forEach(amenity => params.append('amenities', amenity));
    }

    const response = await this.request<ApiResponse<PagedResponse<RoomSearchResultDTO>>>(`/api/v1/search/rooms/location?${params.toString()}`, {
      skipAuth: true,
    });

    return response.data;
  }

  async searchRecentRooms(page: number = 0, size: number = 20): Promise<PagedResponse<RoomSearchResultDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await this.request<ApiResponse<PagedResponse<RoomSearchResultDTO>>>(`/api/v1/search/rooms/recent?${params.toString()}`, {
      skipAuth: true,
    });
    return response.data;
  }

  async searchRoomsByMapBounds(bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }, filters: {
    rentMin?: number;
    rentMax?: number;
    urgency?: string;
    roomTypes?: string[];
    bhkTypes?: string[];
    propertyTypes?: string[];
    amenities?: string[];
    floorMin?: number;
    floorMax?: number;
    gender?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PagedResponse<RoomSearchResultDTO>> {
    const params = new URLSearchParams({
      minLat: bounds.minLat.toString(),
      maxLat: bounds.maxLat.toString(),
      minLng: bounds.minLng.toString(),
      maxLng: bounds.maxLng.toString(),
      page: (filters.page || 0).toString(),
      size: (filters.size || 20).toString(),
    });

    if (filters.rentMin) params.append('rentMin', filters.rentMin.toString());
    if (filters.rentMax) params.append('rentMax', filters.rentMax.toString());
    if (filters.urgency) params.append('urgency', filters.urgency);
    if (filters.floorMin) params.append('floorMin', filters.floorMin.toString());
    if (filters.floorMax) params.append('floorMax', filters.floorMax.toString());
    if (filters.gender) params.append('gender', filters.gender);

    if (filters.roomTypes?.length) {
      filters.roomTypes.forEach(type => params.append('roomTypes', type));
    }
    if (filters.bhkTypes?.length) {
      filters.bhkTypes.forEach(type => params.append('bhkTypes', type));
    }
    if (filters.propertyTypes?.length) {
      filters.propertyTypes.forEach(type => params.append('propertyTypes', type));
    }
    if (filters.amenities?.length) {
      filters.amenities.forEach(amenity => params.append('amenities', amenity));
    }

    const response = await this.request<ApiResponse<PageResponse<Listing>>>(`/api/v1/search/rooms/map?${params.toString()}`, {
      skipAuth: true,
    });
    return response.data;
  }

  async getRoomDetailsForSearch(roomId: string): Promise<RoomListingDetailDTO> {
    const response = await this.request<ApiResponse<RoomListingDetailDTO>>(`/api/v1/search/rooms/${roomId}`, {
      skipAuth: true,
    });
    return response.data!;
  }

  // Configuration endpoint
  async getConfiguration(): Promise<ClientConfigResponse> {
    const response = await this.request<ApiResponse<ClientConfigResponse>>("/api/v1/configuration", {
      skipAuth: true,
    });
    return response.data!;
  }

  // Room Listing endpoints
  async updateRoomStatus(roomId: string, status: string): Promise<RoomListingDTO> {
    const response = await this.request<ApiResponse<RoomListingDTO>>(`/api/v1/listings/rooms/${roomId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return response.data!;
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.request<ApiResponse<null>>(`/api/v1/listings/rooms/${roomId}`, {
      method: "DELETE",
    });
  }

  async createRoom(payload?: any): Promise<RoomListingDTO> {
    const response = await this.request<ApiResponse<RoomListingDTO>>("/api/v1/listings/rooms", {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return response.data!;
  }

  async updateRoom(roomId: string, data: any): Promise<RoomListingDTO> {
    const response = await this.request<ApiResponse<RoomListingDTO>>(`/api/v1/listings/rooms/${roomId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async getMyRooms(status?: "ACTIVE" | "INACTIVE"): Promise<RoomListingDTO[]> {
    const params = status ? `?status=${status}` : "";
    const response = await this.request<ApiResponse<MyRoomsResponse>>(`/api/v1/listings/rooms/my${params}`);

    // Handle both response formats:
    // The API returns { active: RoomListingDTO[], inactive: RoomListingDTO[] }
    if (response.data && typeof response.data === 'object') {
      if (status === "ACTIVE") {
        return Array.isArray(response.data.active) ? response.data.active : [];
      } else if (status === "INACTIVE") {
        return Array.isArray(response.data.inactive) ? response.data.inactive : [];
      }
      // If no status specified, return both combined
      const active = Array.isArray(response.data.active) ? response.data.active : [];
      const inactive = Array.isArray(response.data.inactive) ? response.data.inactive : [];
      return [...active, ...inactive];
    }
    return [];
  }

  async getRoomDetails(roomId: string): Promise<RoomListingDTO> {
    const response = await this.request<ApiResponse<RoomListingDTO>>(`/api/v1/listings/rooms/${roomId}`);
    return response.data!;
  }


  // Media Upload API - New 3-step flow
  async requestMediaUploadUrl(resourceId: string, tag: ResourceTag, mediaType: string, contentType: string): Promise<UploadResponseDto> {
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

    const response = await this.request<ApiResponse<UploadResponseDto>>("/api/v1/media/upload-url", {
      method: "POST",
      body: JSON.stringify({
        resourceId: resourceId,
        tag,
        mediaType: backendMediaType,
        contentType,
      }),
    });
    return response.data!;
  }

  async confirmMediaUpload(uploadId: string): Promise<MediaDto> {
    const response = await this.request<ApiResponse<MediaDto>>(`/api/v1/media/confirm/${uploadId}`, {
      method: "POST",
    });
    return response.data!;
  }

  async reorderMedia(resourceId: string, mediaType: string, tag: string, mediaOrder: { id: number }[]): Promise<void> {
    let backendMediaType = "OTHER";
    if (mediaType.toLowerCase().startsWith("image") || mediaType === "IMAGE") {
      backendMediaType = "IMAGE";
    } else if (mediaType.toLowerCase().startsWith("video") || mediaType === "VIDEO") {
      backendMediaType = "VIDEO";
    }

    await this.request<ApiResponse<null>>("/api/v1/media/reorder", {
      method: "PUT",
      body: JSON.stringify({
        resourceId,
        mediaType: backendMediaType,
        tag,
        mediaOrder,
      }),
    });
  }

  async fetchMediaForResource(resourceId: string, type: string, tag: string): Promise<MediaDto[]> {
    const params = new URLSearchParams({
      type,
      tag
    });

    const response = await this.request<ApiResponse<MediaDto[]>>(`/api/v1/media/resource/${resourceId}?${params.toString()}`);

    return response.data!;
  }

  async deleteMedia(mediaId: number): Promise<void> {
    await this.request<ApiResponse<null>>(`/api/v1/media/${mediaId}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
