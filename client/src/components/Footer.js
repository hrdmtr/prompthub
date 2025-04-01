import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ビルド情報のコンポーネント
const BuildInfo = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  
  // ビルド情報を取得
  const buildInfo = {
    version: process.env.REACT_APP_VERSION || 'dev',
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
    commitId: process.env.REACT_APP_COMMIT_ID || 'local',
    environment: process.env.NODE_ENV || 'development',
    apiUrl: process.env.REACT_APP_API_URL || 'local'
  };
  
  // CORSプロキシ情報を取得（api.jsから直接参照できないため）
  const corsProxyIndex = localStorage.getItem('cors_proxy_index') || '0';
  
  // 現在のコードバージョンを識別するためのユニークなID（生成時刻ベース）
  const jsTimestamp = Date.now();
  
  // コピー機能
  const copyToClipboard = () => {
    const buildInfoText = `
PromptHub Build Info:
- Version: ${buildInfo.version}
- Build Date: ${buildInfo.buildDate}
- Commit: ${buildInfo.commitId}
- Environment: ${buildInfo.environment}
- API URL: ${buildInfo.apiUrl}
- CORS Proxy Index: ${corsProxyIndex}
- JS Timestamp: ${jsTimestamp}
    `;
    
    navigator.clipboard.writeText(buildInfoText).then(() => {
      setCopyStatus('コピーしました!');
      setTimeout(() => setCopyStatus(''), 2000);
    }).catch(() => {
      setCopyStatus('コピーに失敗しました');
      setTimeout(() => setCopyStatus(''), 2000);
    });
  };
  
  return (
    <div className="mt-4 text-xs text-gray-500 flex flex-col items-center">
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="text-gray-500 hover:text-white focus:outline-none"
      >
        v{buildInfo.version} [{jsTimestamp}]
      </button>
      
      {showDetails && (
        <div className="mt-2 p-2 bg-gray-900 rounded text-left min-w-[300px]">
          <p>バージョン: {buildInfo.version}</p>
          <p>ビルド日時: {buildInfo.buildDate}</p>
          <p>コミット: {buildInfo.commitId}</p>
          <p>環境: {buildInfo.environment}</p>
          <p>API URL: {buildInfo.apiUrl}</p>
          <p>CORSプロキシ: {corsProxyIndex}</p>
          <p>JSタイムスタンプ: {jsTimestamp}</p>
          <button 
            onClick={copyToClipboard}
            className="mt-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs"
          >
            {copyStatus || 'コピー'}
          </button>
        </div>
      )}
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-4">PromptHub</h2>
            <p className="text-gray-400">
              AIプロンプトを共有、発見、改善するためのコミュニティ
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">サイト</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">ホーム</Link></li>
                <li><Link to="/explore" className="text-gray-400 hover:text-white">探索</Link></li>
                <li><Link to="/create" className="text-gray-400 hover:text-white">プロンプト作成</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">アカウント</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-white">ログイン</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white">アカウント作成</Link></li>
                <li><Link to="/profile" className="text-gray-400 hover:text-white">プロフィール</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-start">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} PromptHub. All rights reserved.
            </p>
            {/* ビルド情報を表示 */}
            <BuildInfo />
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              プライバシーポリシー
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white">
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;