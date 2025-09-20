// React imports: createContext for data sharing, useContext for consuming context, useState for state management
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// TypeScript type definitions for User and UserRole from types file
import { User, UserRole } from '@/types';
// API functions for authentication-related HTTP requests
import { authAPI } from '@/lib/api';

// TypeScript interface defining the shape of authentication context data
interface AuthContextType {
  user: User | null;                                           // Current authenticated user or null
  login: (email: string, password: string) => Promise<boolean>; // Login function returning success boolean
  logout: () => void;                                          // Logout function to clear session
  isAuthenticated: boolean;                                    // Boolean indicating if user is logged in
  loading: boolean;                                            // Loading state during auth operations
}

// React Context creation: provides authentication state across entire app
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component: wraps entire app to provide authentication context
export function AuthProvider({ children }: { children: ReactNode }) {
  // React state: stores current authenticated user data
  const [user, setUser] = useState<User | null>(null);
  // React state: indicates loading during authentication operations
  const [loading, setLoading] = useState(true);

  // React useEffect: runs once when component mounts to restore authentication
  useEffect(() => {
    // Async function: initializes authentication from stored browser data
    const initAuth = async () => {
      try {
        // Retrieve stored authentication token from browser localStorage
        const token = localStorage.getItem('token');
        // Retrieve stored user data from browser localStorage  
        const storedUser = localStorage.getItem('user');
        
        // Check if both token and user data exist in storage
        if (token && storedUser) {
          // Parse stored user JSON string back to object
          const userData = JSON.parse(storedUser);
          try {
            // Verify token is still valid by fetching current user profile from API
            const profileResponse = await authAPI.getProfile();
            setUser(profileResponse.user); // Set user state with fresh data from API
          } catch (error) {
            // Token is invalid/expired, clear all stored authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null); // Reset user state to null
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error); // Log any initialization errors
      } finally {
        setLoading(false); // Always set loading to false when initialization completes
      }
    };

    initAuth(); // Execute authentication initialization
  }, []); // Empty dependency array = run only once on mount

  // Async function: handles user login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true); // Set loading state during authentication process
      // Call authentication API endpoint with user credentials
      const response = await authAPI.login(email, password);
      
      // Check if API returned both token and user data
      if (response.token && response.user) {
        // Store JWT token in browser localStorage for session persistence across page reloads
        localStorage.setItem('token', response.token);
        // Store user data as JSON string in browser localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user); // Update React state with authenticated user data
        return true; // Return success boolean to calling component
      }
      
      return false; // Return failure if token or user data missing
    } catch (error: any) {
      console.error('Login error:', error); // Log authentication errors for debugging
      
      // Clear any existing stored data on login failure for security
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null); // Reset user state to null
      
      // Re-throw error so calling component can handle the specific error message
      throw error;
    } finally {
      setLoading(false); // Always reset loading state when authentication completes
    }
  };

  // Function: handles user logout by clearing all authentication data
  const logout = () => {
    localStorage.removeItem('token'); // Remove JWT token from browser storage
    localStorage.removeItem('user');  // Remove user data from browser storage
    setUser(null); // Reset user state to null, triggering UI updates
  };

  return (
    // Context Provider: makes authentication data available to all child components
    <AuthContext.Provider value={{
      user,                    // Current authenticated user object or null
      login,                   // Login function for authentication
      logout,                  // Logout function to clear session
      isAuthenticated: !!user, // Boolean conversion: true if user exists, false if null
      loading                  // Loading state during auth operations
    }}>
      {children} {/* Render all child components with access to auth context */}
    </AuthContext.Provider>
  );
}

// Custom React hook: provides easy access to authentication context
export function useAuth() {
  // useContext hook: retrieves authentication context data
  const context = useContext(AuthContext);
  // Error boundary: ensures hook is used within AuthProvider component
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider'); // Helpful error message for developers
  }
  return context; // Return authentication context data for component use
}