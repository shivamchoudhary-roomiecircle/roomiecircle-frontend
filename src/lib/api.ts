const API_BASE_URL = "https://staging-api.roomiecircle.com";

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(skipAuth ? {} : this.getAuthHeader()),
        ...fetchOptions.headers,
      },
    });

    // Parse response to check for TOKEN_EXPIRED error
    const responseData = await response.json().catch(() => null);

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
  async initiateSignup(email: string, password: string, name: string) {
    const response = await this.request<{
      success: boolean;
      data: { message: string; tempId: string };
    }>("/api/v1/auth/signup/initiate-verification", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
    return response.data;
  }

  async verifySignup(tempId: string, code: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        message: string;
        accessToken: string;
        refreshToken: string;
        user: any;
      };
    }>("/api/v1/auth/signup/verify", {
      method: "POST",
      body: JSON.stringify({ tempId, code }),
      skipAuth: true,
    });
    return response.data;
  }

  async resendVerification(tempId: string) {
    const response = await this.request<{
      success: boolean;
      data: { message: string };
    }>("/api/v1/auth/signup/resend-verification", {
      method: "POST",
      body: JSON.stringify({ tempId }),
      skipAuth: true,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        message: string;
        accessToken: string;
        refreshToken: string;
        user: any;
      };
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    return response.data;
  }

  async initiateOtpLogin(email: string) {
    const response = await this.request<{
      success: boolean;
      data: { message: string; tempId: string };
    }>("/api/v1/auth/login/otp/initiate", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
    return response.data;
  }

  async verifyOtpLogin(tempId: string, code: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        message: string;
        accessToken: string;
        refreshToken: string;
        user: any;
      };
    }>("/api/v1/auth/login/otp/verify", {
      method: "POST",
      body: JSON.stringify({ tempId, code }),
      skipAuth: true,
    });
    return response.data;
  }

  async googleSignup(idToken: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        message: string;
        accessToken: string;
        refreshToken: string;
        user: any;
      };
    }>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    });
    return response.data;
  }

  async googleLogin(idToken: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        message: string;
        accessToken: string;
        refreshToken: string;
        user: any;
      };
    }>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    });
    return response.data;
  }

  // Search endpoints
  async searchPlaces(input: string, sessionToken?: string) {
    const params = new URLSearchParams({ input });
    if (sessionToken) params.append("sessionToken", sessionToken);
    
    const response = await this.request<{
      success: boolean;
      data: {
        suggestions: Array<{
          placeId: string;
          description: string;
          mainText: string;
          secondaryText: string;
        }>;
      };
    }>(`/api/v1/places/autocomplete?${params.toString()}`, {
      skipAuth: true,
    });
    return response.data.suggestions;
  }

  async searchPlaceListings(placeId: string, filters: {
    radiusKm?: number;
    minRent?: number;
    maxRent?: number;
    availableAfter?: string;
    propertyType?: string[];
    layoutType?: string[];
    amenities?: string[];
    amenitiesMatch?: string;
    page?: number;
    size?: number;
  }) {
    const response = await this.request<{
      success: boolean;
      data: {
        place: {
          placeId: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
        };
        listings: any[];
      };
    }>(`/api/v1/search/places/${placeId}/listings`, {
      method: "POST",
      body: JSON.stringify({
        radiusKm: filters.radiusKm || 5,
        minRent: filters.minRent || 0,
        maxRent: filters.maxRent || 0,
        availableAfter: filters.availableAfter,
        propertyType: filters.propertyType || [],
        layoutType: filters.layoutType || [],
        amenities: filters.amenities || [],
        amenitiesMatch: filters.amenitiesMatch || "ANY",
        page: filters.page || 0,
        size: filters.size || 50,
      }),
      skipAuth: true,
    });
    return response.data;
  }

  async search(filters: any) {
    const response = await this.request<{
      success: boolean;
      data: any;
    }>("/api/v1/search", {
      method: "POST",
      body: JSON.stringify(filters),
      skipAuth: true,
    });
    return response.data;
  }

  async searchRecentRooms(page: number = 0, size: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await this.request<{
      success: boolean;
      data: {
        content: any[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
        first: boolean;
      };
    }>(`/api/v1/search/rooms/recent?${params.toString()}`, {
      skipAuth: true,
    });
    return response.data;
  }

  async searchRecentRoommates(page: number = 0, size: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await this.request<{
      success: boolean;
      data: {
        content: any[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
        first: boolean;
      };
    }>(`/api/v1/search/roommates/recent?${params.toString()}`, {
      skipAuth: true,
    });
    return response.data;
  }

  async searchListingsByMap(bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }, filters: {
    minRent?: number;
    maxRent?: number;
    availableAfter?: string;
    propertyType?: string[];
    layoutType?: string[];
    amenities?: string[];
    amenitiesMatch?: string;
    page?: number;
    size?: number;
  } = {}) {
    const params = new URLSearchParams({
      minLat: bounds.minLat.toString(),
      maxLat: bounds.maxLat.toString(),
      minLng: bounds.minLng.toString(),
      maxLng: bounds.maxLng.toString(),
      page: (filters.page || 0).toString(),
      size: (filters.size || 50).toString(),
    });

    if (filters.minRent) params.append('minRent', filters.minRent.toString());
    if (filters.maxRent) params.append('maxRent', filters.maxRent.toString());
    if (filters.availableAfter) params.append('availableAfter', filters.availableAfter);
    if (filters.propertyType?.length) {
      filters.propertyType.forEach(type => params.append('propertyType', type));
    }
    if (filters.layoutType?.length) {
      filters.layoutType.forEach(type => params.append('layoutType', type));
    }
    if (filters.amenities?.length) {
      filters.amenities.forEach(amenity => params.append('amenities', amenity));
    }
    if (filters.amenitiesMatch) params.append('amenitiesMatch', filters.amenitiesMatch);

    const response = await this.request<{
      success: boolean;
      data: {
        content: any[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
        first: boolean;
      };
    }>(`/api/v1/search/rooms/map?${params.toString()}`, {
      skipAuth: true,
    });
    return response.data;
  }

  // Configuration endpoint
  async getConfiguration() {
    const response = await this.request<{
      success: boolean;
      data: any;
    }>("/api/v1/configuration", {
      skipAuth: true,
    });
    return response.data;
  }

  // Room Listing endpoints
  async createRoomListing(payload?: any) {
    const response = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>("/api/v1/listings/rooms", {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return response.data;
  }

  async updateRoomListing(listingId: string, data: any) {
    const response = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/v1/listings/rooms/${listingId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getMyListings(status?: "ACTIVE" | "INACTIVE") {
    const params = status ? `?status=${status}` : "";
    const response = await this.request<{
      success: boolean;
      data: any[] | { active: any[]; inactive: any[] };
    }>(`/api/v1/listings/rooms/my${params}`);
    
    // Handle both response formats:
    // 1. If data is an array, return it directly
    // 2. If data is an object with active/inactive keys, return the appropriate array
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
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

  async getRoomListing(listingId: string) {
    const response = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/v1/listings/rooms/${listingId}`);
    return response.data;
  }

  async getPhotoUploadUrl(listingId: string, contentType: string, fileName?: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        uploadUrl: string;
        photoUrl: string;
      };
    }>(`/api/v1/listings/rooms/${listingId}/photos/upload-url`, {
      method: "POST",
      body: JSON.stringify({
        contentType,
        ...(fileName && { fileName }),
      }),
    });
    return response.data;
  }

  async updateListingStatus(listingId: string, status: string) {
    const response = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/v1/listings/rooms/${listingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  async deleteRoomListing(listingId: string) {
    const response = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/v1/listings/rooms/${listingId}`, {
      method: "DELETE",
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
