import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // 認証済みの場合はリダイレクト
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上必要です';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上必要です';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
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
      // 登録APIリクエスト
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // 登録成功はuseEffectが処理
    } catch (error) {
      console.error('登録エラー:', error);
      setErrors({
        submitError: error.response?.data?.message || '登録中にエラーが発生しました。すでに使用されているユーザー名またはメールアドレスの可能性があります。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">アカウント登録</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {errors.submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              ユーザー名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
          </div>
          
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
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
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
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認用）
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
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
            ) : '登録する'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-gray-600">
          すでにアカウントをお持ちですか？{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;