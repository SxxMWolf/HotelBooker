import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 localStorage에서 토큰과 사용자 정보 복원
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('사용자 정보 파싱 실패:', e);
        // 파싱 실패 시 localStorage 정리
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (id, password) => {
    try {
      const response = await authAPI.login({ id, password });
      if (response.data.success && response.data.data && response.data.data.token) {
        const { data } = response.data;
        const userData = { id: data.role === 'USER' ? id : id, role: data.role, username: id };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: response.data.message || '로그인에 실패했습니다' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.id ? error.response.data.id : 
                          (error.response?.data?.password ? error.response.data.password : '로그인에 실패했습니다'));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { data } = response.data;
      if (data && data.token) {
        const user = { id: userData.id, username: userData.id, role: data.role };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
      return { success: false, error: '회원가입에 실패했습니다' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || '회원가입에 실패했습니다' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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

