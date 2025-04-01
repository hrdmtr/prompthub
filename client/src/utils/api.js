import axios from 'axios';

// APIクライアントの作成
console.log('API URL Config:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// CORSプロキシの選択肢
const CORS_PROXIES = [
  { name: 'corsproxy.io', url: 'https://corsproxy.io/?' },
  { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' },
  { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' }
];

// 有効なCORSプロキシを確実に使用するための戦略
function getProxyUrl(baseUrl) {
  // ローカルストレージから以前使用したプロキシのインデックスを取得
  const savedProxyIndex = localStorage.getItem('cors_proxy_index');
  let proxyIndex = savedProxyIndex ? parseInt(savedProxyIndex, 10) : 0;
  
  // インデックスが有効な範囲にあることを確認
  if (isNaN(proxyIndex) || proxyIndex < 0 || proxyIndex >= CORS_PROXIES.length) {
    proxyIndex = 0;
  }
  
  // 選択されたプロキシを使用
  const proxy = CORS_PROXIES[proxyIndex];
  console.log(`Using CORS proxy: ${proxy.name} (${proxyIndex + 1}/${CORS_PROXIES.length})`);
  
  // プロキシを含む完全なURLを返す
  return `${proxy.url}${encodeURIComponent(baseUrl)}`;
}

// API URL設定
let baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://prompthub-api.onrender.com/api'
  : '/api';

console.log('Original API URL:', baseURL);

// プロキシの使用条件
const forceProxy = true; // 開発段階では常にプロキシを使用する（troubelshooting用）
const shouldUseProxy = process.env.NODE_ENV === 'production' || forceProxy;

// 本番環境または強制設定時にプロキシを使用
let finalBaseURL = baseURL;
if (shouldUseProxy) {
  finalBaseURL = getProxyUrl(baseURL);
  console.log(`CORS proxy enabled. Full API URL: ${finalBaseURL}`);
} else {
  console.log('Using direct API connection (no proxy)');
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
    console.log(`API Response Success from: ${response.config.url}`, {
      status: response.status,
      dataPreview: typeof response.data === 'object' ? 'Object data received' : (response.data?.substring?.(0, 50) || response.data)
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status
    });
    
    // CORS関連のエラー処理
    if (error.message === 'Network Error' || 
        (error.response && error.response.status === 0) ||
        error.code === 'ERR_NETWORK') {
      
      console.error('CORS or Network Error detected. Trying alternative proxy...');
      
      // 現在のプロキシインデックスを取得
      let currentProxyIndex = parseInt(localStorage.getItem('cors_proxy_index') || '0', 10);
      
      // 次のプロキシに切り替え
      currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
      localStorage.setItem('cors_proxy_index', currentProxyIndex.toString());
      
      // 新しいプロキシでリクエストを再試行
      const proxy = CORS_PROXIES[currentProxyIndex];
      console.log(`Switching to next proxy: ${proxy.name} (${currentProxyIndex + 1}/${CORS_PROXIES.length})`);
      
      // 元のリクエストを取得
      const originalRequest = error.config;
      const originalUrl = originalRequest.url;
      
      // 新しいプロキシURLを構築（ベースURLではなく完全なURLに対して適用）
      const fullOriginalUrl = baseURL + originalUrl.replace(/^\//, '');
      originalRequest.url = originalUrl; // URLを元のパスに戻す
      originalRequest.baseURL = proxy.url + encodeURIComponent(baseURL);
      
      console.log(`Retrying request with new proxy to: ${originalRequest.baseURL}${originalRequest.url}`);
      
      try {
        return await axios(originalRequest);
      } catch (retryError) {
        console.error('Retry with alternative proxy also failed:', retryError.message);
        
        // すべてのプロキシが失敗した場合、直接接続を試みる
        if (currentProxyIndex === CORS_PROXIES.length - 1) {
          console.log('All proxies failed. Attempting direct connection...');
          originalRequest.baseURL = baseURL;
          try {
            return await axios(originalRequest);
          } catch (directError) {
            console.error('Direct connection also failed:', directError.message);
          }
        }
        
        return Promise.reject(retryError);
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