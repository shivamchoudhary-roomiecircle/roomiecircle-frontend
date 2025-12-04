import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  profilePicture: string | null;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    return await authApi.refreshToken();
  }, []);

  const login = useCallback((accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.message) {
        sessionStorage.setItem("tokenExpiredMessage", customEvent.detail.message);
      }
      logout();
      window.location.href = "/auth/login";
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken) {
        try {
          const decoded: any = jwtDecode(token);
          const now = Date.now();
          const expirationTime = decoded.exp * 1000;

          // If token is expired, try to refresh
          if (expirationTime < now) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                setUser(JSON.parse(storedUser));
              }
            } else {
              logout();
            }
          } else {
            // Token is valid, restore user
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [logout, refreshAccessToken]);

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!user) return;

    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const decoded: any = jwtDecode(token);
        const now = Date.now();
        const expirationTime = decoded.exp * 1000;
        const timeUntilExpiry = expirationTime - now;

        // Refresh if token expires in less than 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    };

    // Check token expiration every minute
    const interval = setInterval(checkAndRefreshToken, 60 * 1000);

    // Also check immediately
    checkAndRefreshToken();

    return () => clearInterval(interval);
  }, [user, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
