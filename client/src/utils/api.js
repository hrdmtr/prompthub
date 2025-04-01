import axios from 'axios';

// APIクライアントの作成
console.log('API URL Config:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// CORSエラーを回避するプロキシサービス
const CORS_PROXY = 'https://corsproxy.io/?';

// API URL設定（CORS Proxy対応版）
let baseURL = '/api';
let useProxy = false;

// 本番環境では常にプロキシを使用
if (process.env.NODE_ENV === 'production') {
  baseURL = 'https://prompthub-api.onrender.com/api';
  useProxy = true;
  console.log('Using proxy for API calls in production');
}
// 開発環境で環境変数があれば使用
else if (process.env.REACT_APP_API_URL) {
  baseURL = `${process.env.REACT_APP_API_URL}/api`;
  console.log('Using API URL from env:', baseURL);
}

// プロキシ対応のURLを構築
const finalBaseURL = useProxy ? `${CORS_PROXY}${encodeURIComponent(baseURL)}` : baseURL;
console.log('Final API URL:', finalBaseURL);

const api = axios.create({
  baseURL: finalBaseURL,
  withCredentials: false, // クロスドメインでのCookie送信を無効化
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// デバッグ情報
console.log('API Client Configuration:', {
  baseURL,
  withCredentials: false,
  productionMode: process.env.NODE_ENV === 'production'
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    // デバッグ情報
    console.log(`API Request to: ${config.url}`, {
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    // 成功レスポンスの処理
    console.log(`API Response from: ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // エラーレスポンスの処理
    console.error('API Response Error:', error);
    
    // CORSエラーの場合の詳細情報
    if (error.message === 'Network Error') {
      console.error('CORS Error detected. Check server configuration.');
      
      // 修正案を表示
      console.info('Try these solutions:', [
        'Ensure backend CORS settings allow this origin',
        'Check if backend server is running',
        'Verify API endpoint URL is correct'
      ]);
    }
    
    return Promise.reject(error);
  }
);

// プロンプト関連のAPI
export const promptService = {
  // プロンプト一覧取得
  getPrompts: (params = {}) => api.get('/prompts', { params }),
  
  // プロンプト詳細取得
  getPromptById: (id) => api.get(`/prompts/${id}`),
  
  // プロンプト作成
  createPrompt: (promptData) => api.post('/prompts', promptData),
  
  // プロンプト更新
  updatePrompt: (id, promptData) => api.put(`/prompts/${id}`, promptData),
  
  // プロンプト削除
  deletePrompt: (id) => api.delete(`/prompts/${id}`),
  
  // いいね追加/削除
  toggleLike: (id) => api.put(`/prompts/like/${id}`),
  
  // コメント追加
  addComment: (id, content) => api.post(`/prompts/comment/${id}`, { content }),
  
  // コメント削除
  deleteComment: (promptId, commentId) => api.delete(`/prompts/comment/${promptId}/${commentId}`),
  
  // 使用回数増加
  incrementUsage: (id) => api.put(`/prompts/use/${id}`)
};

// 認証関連のAPI
export const authService = {
  // ユーザー登録
  register: (userData) => api.post('/auth/register', userData),
  
  // ログイン
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 現在のユーザー情報取得
  getCurrentUser: () => api.get('/auth/me')
};

// ユーザー関連のAPI
export const userService = {
  // ユーザー情報取得
  getUserById: (id) => api.get(`/users/${id}`),
  
  // ユーザープロフィール更新
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // プロンプト保存/削除
  toggleSavePrompt: (promptId) => api.put(`/users/save/${promptId}`)
};

export default api;