import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Hydrate immediately from storage so UI isn't blank
          setUser(JSON.parse(storedUser));
          // Then verify & refresh from server
          const response = await authAPI.getMe();
          const freshUser = response.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          // Token invalid — try refresh (handled by axios interceptor)
          // If refresh fails, the interceptor clears storage
          const stored = localStorage.getItem('token');
          if (!stored) {
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return response.data;
  };

  const register = async (username, email, password) => {
    const response = await authAPI.register({ username, email, password });
    if (!response.data?.token) throw new Error('Invalid response from server');
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {
      // Silently ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const response = await authAPI.updateProfile(data);
    const updated = response.data;
    setUser(prev => ({ ...prev, ...updated }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
