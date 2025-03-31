import React, { createContext, useState, useEffect } from 'react';
import { authService, userService } from '../utils/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初期化時にトークンを確認
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // トークンの有効期限を確認
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // トークンが期限切れの場合
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // ユーザー情報を取得
        const res = await authService.getCurrentUser();
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        setError(error.response?.data?.message || 'ユーザー情報の取得に失敗しました');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // ログイン処理
  const login = async (credentials) => {
    try {
      setError(null);
      const res = await authService.login(credentials);
      const { token } = res.data;
      
      localStorage.setItem('token', token);
      
      // ユーザー情報を取得
      const userRes = await authService.getCurrentUser();
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return userRes.data;
    } catch (error) {
      setError(error.response?.data?.message || 'ログインに失敗しました');
      throw error;
    }
  };
  
  // ユーザー登録処理
  const register = async (userData) => {
    try {
      setError(null);
      const res = await authService.register(userData);
      const { token } = res.data;
      
      localStorage.setItem('token', token);
      
      // ユーザー情報を取得
      const userRes = await authService.getCurrentUser();
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return userRes.data;
    } catch (error) {
      setError(error.response?.data?.message || '登録に失敗しました');
      throw error;
    }
  };
  
  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // アカウント更新処理
  const updateAccount = async (userData) => {
    try {
      setError(null);
      const res = await userService.updateProfile(userData);
      setUser(res.data);
      return res.data;
    } catch (error) {
      setError(error.response?.data?.message || 'プロフィールの更新に失敗しました');
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        updateAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;