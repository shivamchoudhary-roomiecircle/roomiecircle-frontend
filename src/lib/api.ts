const API_BASE_URL = 'https://api-staging.roomiecircle.com';

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the request
        return this.request(endpoint, options);
      } else {
        // Clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const accessToken = data.accessToken || data.data?.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
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
    }>('/api/v1/auth/signup/initiate-verification', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
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
    }>('/api/v1/auth/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ tempId, code }),
    });
    return response.data;
  }

  async resendVerification(tempId: string) {
    const response = await this.request<{
      success: boolean;
      data: { message: string };
    }>('/api/v1/auth/signup/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ tempId }),
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
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  }

  async initiateOtpLogin(email: string) {
    const response = await this.request<{
      success: boolean;
      data: { message: string; tempId: string };
    }>('/login/otp/initiate', {
      method: 'POST',
      body: JSON.stringify({ email }),
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
    }>('/api/v1/auth/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ tempId, code }),
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
    }>('/api/v1/auth/google/signup', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
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
    }>('/api/v1/auth/google/login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
