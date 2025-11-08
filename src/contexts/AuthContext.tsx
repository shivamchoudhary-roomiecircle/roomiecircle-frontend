import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            if (!refreshed) {
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
  }, []);

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
  }, [user]);

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch('https://api-staging.roomiecircle.com/api/v1/auth/token/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken || data.data?.accessToken);
      return true;
    } catch {
      return false;
    }
  };

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
