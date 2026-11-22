import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, favoritesAPI } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoriteIds = useCallback(async () => {
    try {
      const response = await favoritesAPI.getFavoriteIds();
      const ids = Array.isArray(response.data)
        ? response.data
        : (response.data?.favoriteIds || []);
      setFavoriteIds(ids.map(id => id.toString()));
    } catch {
      // Failed to load favorite IDs, keep previous or empty
    }
  }, []);

  const toggleFavoriteId = useCallback((snippetId, isFav) => {
    if (!snippetId) return;
    const strId = snippetId.toString();
    setFavoriteIds(prev => {
      if (isFav) {
        return prev.includes(strId) ? prev : [...prev, strId];
      } else {
        return prev.filter(id => id !== strId);
      }
    });
  }, []);

  const isFavorited = useCallback((snippetId) => {
    if (!snippetId) return false;
    return favoriteIds.includes(snippetId.toString());
  }, [favoriteIds]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Hydrate immediately from storage so UI isn't blank
          setUser(JSON.parse(storedUser));
          fetchFavoriteIds();
          // Then verify & refresh from server
          const response = await authAPI.getMe();
          const freshUser = response.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch {
          // Token invalid — try refresh (handled by axios interceptor)
          // If refresh fails, the interceptor clears storage
          const stored = localStorage.getItem('token');
          if (!stored) {
            setUser(null);
            setFavoriteIds([]);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchFavoriteIds]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    fetchFavoriteIds();
    return response.data;
  };

  const register = async (username, email, password) => {
    const response = await authAPI.register({ username, email, password });
    if (!response.data?.token) throw new Error('Invalid response from server');
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    fetchFavoriteIds();
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Silently ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setFavoriteIds([]);
  };

  const updateProfile = async (data) => {
    const response = await authAPI.updateProfile(data);
    const updated = response.data;
    setUser(prev => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      updateProfile,
      favoriteIds,
      fetchFavoriteIds,
      isFavorited,
      toggleFavoriteId
    }}>
      {children}
    </AuthContext.Provider>
  );
};
