import axios from 'axios';

// APIクライアントの作成
console.log('API URL Config:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// CORSプロキシの選択肢 - 信頼性の高いプロキシを優先順位で並べる
const CORS_PROXIES = [
  { name: 'corsproxy.io', url: 'https://corsproxy.io/?' },
  { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
  { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' },
  { name: 'corsanywhere', url: 'https://cors-anywhere.herokuapp.com/' },
  { name: 'cors.sh', url: 'https://proxy.cors.sh/' }
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
// 同じドメインの相対パスを使用する
// すべてのリクエストを https://prompthub-gsxd.onrender.com/api/* に送信
let baseURL = '/api';

console.log('Original API URL:', baseURL);

// プロキシの使用条件
// プロンプト一覧ページでのCORS問題のため、本番環境では常にプロキシを使用
const forceProxy = false; // プロキシを無効化、直接APIアクセス
const shouldUseProxy = process.env.NODE_ENV === 'production' || forceProxy;

// プロキシの使用状態をリセット - 直接アクセスに変更
localStorage.setItem('using_proxy', 'false');
localStorage.setItem('cors_proxy_index', '0');
let isUsingProxy = false;

// プロキシ使用オプションをすべて無効化 - 直接APIアクセスのみを使用

// 本番環境または強制設定時にプロキシを使用
let finalBaseURL = baseURL;
if (isUsingProxy) {
  finalBaseURL = getProxyUrl(baseURL);
  console.log(`CORS proxy enabled (${isUsingProxy}). Full API URL: ${finalBaseURL}`);
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
    
    // 詳細なデバッグ情報
    const fullUrl = config.baseURL ? 
      (config.baseURL.endsWith('/') && config.url.startsWith('/') ? 
        config.baseURL.slice(0, -1) + config.url : 
        config.baseURL + config.url) : 
      config.url;
    
    // スタックトレースを取得して呼び出し元を特定
    const stackTrace = new Error().stack;
    
    console.log('%c【APIリクエストの詳細情報】', 'color: blue; font-weight: bold;');
    console.log(`🔴 完全なURL: ${fullUrl}`);
    console.log(`🔵 ベースURL: ${config.baseURL || '(なし)'}`);
    console.log(`🟡 パスURL: ${config.url}`);
    console.log(`📋 メソッド: ${config.method}`);
    console.log(`🔍 リクエスト元: ${stackTrace}`);
    console.log('📦 リクエストデータ:', config.data || '(なし)');
    console.log('🔑 ヘッダー:', config.headers);
    
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
    // 成功レスポンスの詳細情報
    const fullUrl = response.config.baseURL ? 
      (response.config.baseURL.endsWith('/') && response.config.url.startsWith('/') ? 
        response.config.baseURL.slice(0, -1) + response.config.url : 
        response.config.baseURL + response.config.url) : 
      response.config.url;
    
    console.log('%c【APIレスポンスの詳細情報】', 'color: green; font-weight: bold;');
    console.log(`✅ リクエスト成功: ${fullUrl}`);
    console.log(`📊 ステータス: ${response.status}`);
    console.log(`🕒 処理時間: ${response.headers['x-response-time'] || 'N/A'}`);
    console.log('📦 レスポンスデータ:', response.data);
    return response;
  },
  async (error) => {
    // エラーレスポンスの詳細情報
    let fullUrl = '不明';
    if (error.config) {
      fullUrl = error.config.baseURL ? 
        (error.config.baseURL.endsWith('/') && error.config.url.startsWith('/') ? 
          error.config.baseURL.slice(0, -1) + error.config.url : 
          error.config.baseURL + error.config.url) : 
        error.config.url;
    }
    
    console.log('%c【APIエラーの詳細情報】', 'color: red; font-weight: bold;');
    console.log(`❌ リクエスト失敗: ${fullUrl}`);
    console.log(`⚠️ エラーメッセージ: ${error.message}`);
    console.log(`🔢 エラーコード: ${error.code || 'なし'}`);
    console.log(`📋 メソッド: ${error.config?.method || '不明'}`);
    console.log(`📊 ステータス: ${error.response?.status || '不明'}`);
    
    if (error.response) {
      console.log('📦 エラーレスポンス:', error.response.data);
    }
    
    // スタックトレースを取得して呼び出し元を特定
    const stackTrace = new Error().stack;
    console.log(`🔍 エラー発生場所: ${stackTrace}`);
    
    // CORS関連のエラー処理
    if (error.message === 'Network Error' || 
        (error.response && error.response.status === 0) ||
        error.code === 'ERR_NETWORK' ||
        (error.response && error.response.status === 404)) {
      
      // プロキシを有効化
      if (!isUsingProxy) {
        console.log('Activating CORS proxy due to error');
        localStorage.setItem('using_proxy', 'true');
        isUsingProxy = true;
      }
      
      console.error('CORS or Network Error detected. Trying alternative proxy...');
      console.error('Error details:', error.message, error.code);
      
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
      
      // 絶対URLを構築
      const apiHost = baseURL.startsWith('http') ? baseURL : window.location.origin + baseURL;
      const fullApiUrl = apiHost + (originalUrl.startsWith('/') ? originalUrl.substring(1) : originalUrl);
      console.log('Full API URL:', fullApiUrl);
      
      // 新しいプロキシURLを構築
      originalRequest.url = originalUrl; // URLを元のパスに戻す
      const proxyUrl = proxy.url + encodeURIComponent(fullApiUrl);
      
      // axios のバグ回避のため、baseURL を null にして完全な URL を url に設定
      originalRequest.baseURL = '';
      originalRequest.url = proxyUrl;
      
      console.log(`Retrying request with new proxy to: ${proxyUrl}`);
      
      // ローカルストレージにデバッグ情報を保存
      try {
        const debugInfo = {
          timestamp: new Date().toISOString(),
          originalUrl: originalUrl,
          fullApiUrl: fullApiUrl,
          proxyUrl: proxyUrl,
          proxyName: proxy.name,
          proxyIndex: currentProxyIndex
        };
        localStorage.setItem('last_proxy_debug', JSON.stringify(debugInfo));
      } catch (e) {
        console.error('Error saving debug info:', e);
      }
      
      try {
        // 新しいRequestをCORS Proxyに送信
        return await axios(originalRequest);
      } catch (retryError) {
        console.error('Retry with alternative proxy also failed:', retryError.message);
        
        // 1つのプロキシが失敗しても、すべて試すわけではない
        // 最大2つのプロキシまで試した後、エラーを返す
        if (currentProxyIndex < 2) {
          console.log('First proxy failed. Trying one more proxy...');
          // もう一度プロキシを変えて試す - 基本的に再帰呼び出し
          // この時点でエラーを返す (このコールバックがまた呼ばれる)
          return Promise.reject(retryError);
        }
        
        console.error('Multiple proxies failed. Giving up.');
        return Promise.reject(retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 改善されたAPIエラーハンドラー
export const handleApiError = (error) => {
  // デバッグ情報を記録
  console.error('API Error in handleApiError:', {
    message: error.message,
    code: error.code,
    url: error.config?.url,
    status: error.response?.status
  });
  
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
      errorMessage = 'リソースが見つかりません。別のCORSプロキシで再試行します...';
      
      // CORSプロキシを切り替え
      const currentProxyIndex = parseInt(localStorage.getItem('cors_proxy_index') || '0', 10);
      const nextProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
      localStorage.setItem('cors_proxy_index', nextProxyIndex.toString());
      
      // 強制的にプロキシを有効化
      localStorage.setItem('using_proxy', 'true');
      
    } else if (status === 500) {
      errorMessage = 'サーバーエラーが発生しました。しばらく経ってから再度お試しください。';
    }
  } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    // プロキシを切り替え
    const currentProxyIndex = parseInt(localStorage.getItem('cors_proxy_index') || '0', 10);
    const nextProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
    localStorage.setItem('cors_proxy_index', nextProxyIndex.toString());
    
    // 強制的にプロキシを有効化
    localStorage.setItem('using_proxy', 'true');
    
    errorMessage = 'ネットワークエラー。別のCORSプロキシで再試行します...';
  }
  
  return errorMessage;
};

// プロンプト関連のAPI
export const promptService = {
  // プロンプト一覧取得
  getPrompts: (params = {}) => api.get('/prompts', { params }),
  
  // プロンプト詳細取得
  getPromptById: (id, showDeleted = false) => api.get(`/prompts/${id}`, { 
    params: { showDeleted: showDeleted ? 'true' : 'false' } 
  }),
  
  // プロンプト作成
  createPrompt: (promptData) => api.post('/prompts', promptData),
  
  // プロンプト更新
  updatePrompt: (id, promptData) => api.put(`/prompts/${id}`, promptData),
  
  // プロンプト削除（論理削除）
  deletePrompt: (id) => api.delete(`/prompts/${id}`),
  
  // プロンプト復元
  restorePrompt: (id) => api.put(`/prompts/restore/${id}`),
  
  // 削除済みプロンプト一覧取得（管理画面用）
  getDeletedPrompts: () => api.get('/prompts', { params: { showDeleted: 'true' } }),
  
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