import axios from 'axios';

// APIクライアントの作成
console.log('API URL Config:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// 確実にCORS問題を解決するために複数のプロキシを用意
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://proxy.cors.sh/'
];

// 最初のプロキシを使用
const CORS_PROXY = CORS_PROXIES[0];

// API URL設定
let baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://prompthub-api.onrender.com/api'
  : '/api';

console.log('Original API URL:', baseURL);

// 本番環境では常にプロキシを使用
let finalBaseURL = baseURL;
if (process.env.NODE_ENV === 'production') {
  finalBaseURL = `${CORS_PROXY}${encodeURIComponent(baseURL)}`;
  console.log('Using proxy for API calls:', finalBaseURL);
}

// axios実例を作成
const api = axios.create({
  baseURL: finalBaseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  // タイムアウト設定
  timeout: 10000
});

// デバッグ情報
console.log('API Client Configuration:', {
  baseURL: finalBaseURL,
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
      console.error('CORS Error detected. Trying direct API access...');
      
      // プロキシを使用せずに直接リクエストを試みる
      if (process.env.NODE_ENV === 'production') {
        // このリクエストのみプロキシを使用しない
        const originalRequest = error.config;
        originalRequest.baseURL = baseURL;
        
        // プロキシなしでリトライ
        console.log('Retrying without proxy:', originalRequest);
        return axios(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// 単純化したAPIエラーハンドラー
export const handleApiError = (error) => {
  let errorMessage = 'エラーが発生しました。もう一度お試しください。';
  
  if (error.response) {
    // サーバーからのレスポンスがある場合
    const status = error.response.status;
    
    if (status === 400) {
      errorMessage = error.response.data.message || '入力データが正しくありません。';
    } else if (status === 401) {
      errorMessage = 'ログインが必要です。';
      // ログアウト処理
      localStorage.removeItem('token');
    } else if (status === 404) {
      errorMessage = 'リソースが見つかりません。';
    } else if (status === 500) {
      errorMessage = 'サーバーエラーが発生しました。';
    }
  } else if (error.message === 'Network Error') {
    errorMessage = 'ネットワークエラー。インターネット接続を確認してください。';
  }
  
  return errorMessage;
};

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