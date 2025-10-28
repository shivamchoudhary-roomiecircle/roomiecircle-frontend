const API_BASE_URL = 'https://roomiecircle-prod.com';

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
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async initiateSignup(email: string, password: string, name: string) {
    return this.request<{ message: string; tempId: string }>(
      '/api/v1/auth/signup/initiate-verification',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }
    );
  }

  async verifySignup(tempId: string, code: string) {
    return this.request<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ tempId, code }),
    });
  }

  async resendVerification(tempId: string) {
    return this.request<{ message: string }>(
      '/api/v1/auth/signup/resend-verification',
      {
        method: 'POST',
        body: JSON.stringify({ tempId }),
      }
    );
  }

  async login(email: string, password: string) {
    return this.request<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async googleSignup(idToken: string) {
    return this.request<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/google/signup', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  async googleLogin(idToken: string) {
    return this.request<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/google/login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }
}

export const apiClient = new ApiClient();
