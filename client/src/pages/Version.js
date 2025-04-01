import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// CORSプロキシは不要 - 直接APIアクセスを使用
const CORS_PROXIES = [];

// バージョン情報ページコンポーネント
const Version = () => {
  const [clientInfo, setClientInfo] = useState({
    loading: true,
    error: null,
    data: null
  });
  
  const [serverInfo, setServerInfo] = useState({
    loading: true,
    error: null,
    data: null,
    usingProxy: false
  });
  
  const navigate = useNavigate();
  
  // クライアント側のバージョン情報
  useEffect(() => {
    // クライアント側の情報収集
    const collectClientInfo = () => {
      const jsTimestamp = Date.now();
      const buildInfo = {
        version: process.env.REACT_APP_VERSION || 'dev',
        buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
        commitId: process.env.REACT_APP_COMMIT_ID || 'local',
        environment: process.env.NODE_ENV || 'development',
        timestamp: jsTimestamp,
        userAgent: navigator.userAgent,
        language: navigator.language,
        corsProxyIndex: localStorage.getItem('cors_proxy_index') || 'not set',
        renderTime: new Date().toISOString()
      };
      
      setClientInfo({
        loading: false,
        error: null,
        data: buildInfo
      });
    };
    
    collectClientInfo();
  }, []);
  
  // サーバー側のバージョン情報を取得する関数（コンポーネント内で再利用できるように外部化）
  const fetchServerInfo = async () => {
    try {
        // 1秒程度の遅延を入れて、クライアント情報とサーバー情報の取得時間に差をつける
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 同じドメインの相対パスを使用
        // フロントエンドとバックエンドが同じドメインで動作している場合
        const apiUrl = '/version';
        
        console.log(`Fetching version info from: ${apiUrl}`);
        
        // 直接アクセスのみ
        const response = await axios.get(apiUrl);
        console.log('✅ Successfully fetched version information');
        
        // プロキシは使用しない
        const usingProxy = false;
        
        // レスポンスを検証（必要な情報が含まれているか）
        if (!response.data || !response.data.status || !response.data.server) {
          throw new Error('サーバーからの応答が正しい形式ではありません。バージョンエンドポイントが正しく実装されているか確認してください。');
        }
        
        setServerInfo({
          loading: false,
          error: null,
          data: response.data,
          usingProxy: usingProxy
        });
      } catch (error) {
        console.error('Server version fetch error:', error);
        setServerInfo({
          loading: false,
          error: `サーバーからの情報取得に失敗しました: ${error.message}`,
          data: null,
          usingProxy: false
        });
      }
    };
  
  // 初回マウント時にサーバー情報を取得
  useEffect(() => {
    fetchServerInfo();
  }, []);
  
  // クリップボードにコピーする関数
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('クリップボードにコピーしました'))
      .catch(err => alert(`コピーに失敗しました: ${err}`));
  };
  
  // JSONを整形して表示
  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">PromptHub バージョン情報</h1>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          ホームに戻る
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* クライアント情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">フロントエンド情報</h2>
            <button 
              onClick={() => copyToClipboard(formatJSON(clientInfo.data))}
              className="text-blue-500 hover:text-blue-700"
              disabled={clientInfo.loading}
            >
              コピー
            </button>
          </div>
          
          {clientInfo.loading ? (
            <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
          ) : clientInfo.error ? (
            <div className="text-red-500">{clientInfo.error}</div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-gray-600">バージョン:</div>
                <div className="font-medium">{clientInfo.data.version}</div>
                
                <div className="text-gray-600">環境:</div>
                <div className="font-medium">{clientInfo.data.environment}</div>
                
                <div className="text-gray-600">ビルド日時:</div>
                <div className="font-medium">{clientInfo.data.buildDate}</div>
                
                <div className="text-gray-600">コミットID:</div>
                <div className="font-medium">{clientInfo.data.commitId}</div>
                
                <div className="text-gray-600">表示タイムスタンプ:</div>
                <div className="font-medium">{clientInfo.data.timestamp}</div>
                
                <div className="text-gray-600">CORSプロキシ:</div>
                <div className="font-medium">{clientInfo.data.corsProxyIndex}</div>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-500">詳細情報</summary>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-xs overflow-auto max-h-60">
                  {formatJSON(clientInfo.data)}
                </pre>
              </details>
            </div>
          )}
        </div>
        
        {/* サーバー情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">バックエンド情報</h2>
            <button 
              onClick={() => copyToClipboard(formatJSON(serverInfo.data))}
              className="text-blue-500 hover:text-blue-700"
              disabled={serverInfo.loading}
            >
              コピー
            </button>
          </div>
          
          {serverInfo.loading ? (
            <div className="animate-pulse h-40 bg-gray-200 rounded"></div>
          ) : serverInfo.error ? (
            <div>
              <div className="text-red-500 mb-4">{serverInfo.error}</div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    setServerInfo({ loading: true, error: null, data: null, usingProxy: false });
                    // プロキシインデックスを強制的に次へ
                    const currentIndex = parseInt(localStorage.getItem('cors_proxy_index') || '0', 10);
                    const nextIndex = (currentIndex + 1) % CORS_PROXIES.length;
                    localStorage.setItem('cors_proxy_index', nextIndex.toString());
                    
                    // 再フェッチを実行（遅延付き）
                    setTimeout(() => {
                      fetchServerInfo();
                    }, 500);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  別のプロキシで再試行
                </button>
                
                <button 
                  onClick={() => {
                    setServerInfo({ loading: true, error: null, data: null, usingProxy: false });
                    // そのまま再試行
                    setTimeout(() => {
                      fetchServerInfo();
                    }, 500);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                >
                  同じURLで再試行
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-gray-600">ステータス:</div>
                <div className="font-medium">
                  {serverInfo.data.status}
                  {serverInfo.usingProxy && 
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">CORSプロキシ使用中</span>
                  }
                </div>
                
                <div className="text-gray-600">バージョン:</div>
                <div className="font-medium">{serverInfo.data.version}</div>
                
                <div className="text-gray-600">環境:</div>
                <div className="font-medium">{serverInfo.data.environment}</div>
                
                <div className="text-gray-600">サーバー時間:</div>
                <div className="font-medium">{serverInfo.data.server.date}</div>
                
                <div className="text-gray-600">稼働時間:</div>
                <div className="font-medium">{serverInfo.data.server.uptime} 秒</div>
                
                <div className="text-gray-600">コミットID:</div>
                <div className="font-medium">{serverInfo.data.server.commit.slice(0, 10)}...</div>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-500">詳細情報</summary>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-xs overflow-auto max-h-60">
                  {formatJSON(serverInfo.data)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
      
      {/* デプロイステータス */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">デプロイステータス</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">フロントエンド更新状態</h3>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${clientInfo.loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span>{clientInfo.loading ? '確認中...' : '最新のコードが読み込まれています'}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              タイムスタンプ: {clientInfo.data ? new Date(clientInfo.data.timestamp).toLocaleString() : '確認中...'}
            </p>
          </div>
          
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">バックエンド更新状態</h3>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${serverInfo.loading ? 'bg-yellow-500' : serverInfo.error ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span>
                {serverInfo.loading ? '確認中...' : 
                 serverInfo.error ? 'サーバーに接続できませんでした' : 'サーバーが応答しています'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              サーバー時間: {serverInfo.data ? new Date(serverInfo.data.server.timestamp).toLocaleString() : '確認中...'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              接続方法: 直接接続
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-sm">
        このページはPromptHubのビルドとデプロイの状態を確認するための診断ツールです。
        <br />
        © {new Date().getFullYear()} PromptHub - ビルド/デプロイ確認ページ
      </div>
    </div>
  );
};

export default Version;