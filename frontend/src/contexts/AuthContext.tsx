import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored auth data on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Verify token is still valid by fetching current user profile
          const userData = JSON.parse(storedUser);
          try {
            const profileResponse = await authAPI.getProfile();
            setUser(profileResponse.user);
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function that handles user authentication with error handling
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Call authentication API with user credentials
      const response = await authAPI.login(email, password);
      
      if (response.token && response.user) {
        // Store JWT token and user data in localStorage for session persistence
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear any existing stored data on login failure for security
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Re-throw error so component can handle the specific error message
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}