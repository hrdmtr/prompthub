import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // リダイレクト元がある場合はそこへ戻る
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);
  
  // 認証エラーを表示
  useEffect(() => {
    if (authError) {
      setErrors({ submitError: authError });
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // エラーをクリア
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    }
    
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // ログインAPIリクエスト
      await login({
        email: formData.email,
        password: formData.password
      });
      
      // ログイン成功はuseEffectが処理
    } catch (error) {
      console.error('ログインエラー:', error);
      setErrors({
        submitError: error.response?.data?.message || 'ログイン中にエラーが発生しました。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">ログイン</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {errors.submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                パスワードをお忘れですか？
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'ログイン'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-gray-600">
          アカウントをお持ちでないですか？{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;