import axios from 'axios';

// APIクライアントの作成
console.log('API URL Config:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// API URL設定（Render対応強化版）
let baseURL = '/api';

// 本番環境でREACT_APP_API_URLがある場合は使用
if (process.env.REACT_APP_API_URL) {
  baseURL = `${process.env.REACT_APP_API_URL}/api`;
  console.log('Using API URL from env:', baseURL);
}
// 明示的にRender環境用のフォールバック
else if (process.env.NODE_ENV === 'production') {
  baseURL = 'https://prompthub-api.onrender.com/api';
  console.log('Using fallback Render API URL:', baseURL);
}

const api = axios.create({
  baseURL,
  withCredentials: true, // CORS認証のためにクッキーを送信
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// デバッグ情報
console.log('API Client Configuration:', {
  baseURL,
  withCredentials: true,
  productionMode: process.env.NODE_ENV === 'production'
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
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