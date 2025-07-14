import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token validity with backend (optional)
          // await authAPI.getProfile();
        } catch (error) {
          // If token is invalid, clear authentication
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          return {
            success: false,
            error: data.error || 'Invalid email or password'
          };
        } else if (status === 429) {
          return {
            success: false,
            error: 'Too many login attempts. Please try again later.'
          };
        } else if (data && data.error) {
          return {
            success: false,
            error: data.error
          };
        }
      }
      
      // Generic error
      return { 
        success: false, 
        error: 'Unable to sign in. Please try again later.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400 && data.error && data.error.includes('already exists')) {
          return {
            success: false,
            error: 'This email is already registered. Please use a different email or sign in.'
          };
        } else if (data && data.error) {
          return {
            success: false,
            error: data.error
          };
        }
      }
      
      // Generic error
      return { 
        success: false, 
        error: 'Unable to create account. Please try again later.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const verifyIdentity = async (photoFile, idCardFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('idCard', idCardFile);
      
      const response = await authAPI.verifyIdentity(formData);
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Identity verification error:', error);
      
      // Handle specific error cases
      if (error.response && error.response.data && error.response.data.error) {
        return {
          success: false,
          error: error.response.data.error
        };
      }
      
      return { 
        success: false, 
        error: 'Identity verification failed. Please try again.'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    verifyIdentity,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

