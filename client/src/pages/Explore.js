import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '../utils/api';
import axios from 'axios';

const Explore = () => {
  // フィルター状態
  const [filters, setFilters] = useState({
    category: 'all',
    purpose: 'all',
    sort: 'latest'
  });

  // 検索クエリ状態
  const [searchQuery, setSearchQuery] = useState('');
  
  // プロンプトデータ状態
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // プロンプトデータを取得
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        
        // CORSプロキシのリスト
        const CORS_PROXIES = [
          { name: 'corsproxy.io', url: 'https://corsproxy.io/?' },
          { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
          { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' }
        ];
        
        // プロキシインデックスの取得
        const proxyIndex = parseInt(localStorage.getItem('cors_proxy_index') || '0', 10) % CORS_PROXIES.length;
        const selectedProxy = CORS_PROXIES[proxyIndex];
        
        // 通常の方法でまず試す
        try {
          console.log('通常のAPIで試行...');
          const response = await promptService.getPrompts({
            category: filters.category !== 'all' ? filters.category : undefined,
            purpose: filters.purpose !== 'all' ? filters.purpose : undefined,
            search: searchQuery || undefined,
            sort: filters.sort
          });
          setPrompts(response.data);
          setError(null);
          console.log('標準APIコールが成功');
          return; // 成功したら終了
        } catch (standardError) {
          console.warn('標準APIコールが失敗:', standardError.message);
          // 失敗したら直接CORSプロキシを使用
        }
        
        // ダイレクトプロキシを使用（バックアップアプローチ）
        console.log(`CORSプロキシを使用: ${selectedProxy.name}`);
        const apiUrl = 'https://prompthub-api.onrender.com/api/prompts';
        
        // クエリパラメータを構築
        const queryParams = new URLSearchParams();
        if (filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.purpose !== 'all') queryParams.append('purpose', filters.purpose);
        if (searchQuery) queryParams.append('search', searchQuery);
        queryParams.append('sort', filters.sort);
        
        // 完全なURLを構築
        const fullUrl = `${apiUrl}?${queryParams.toString()}`;
        console.log('完全なURL:', fullUrl);
        
        // プロキシURLを構築
        const proxyUrl = `${selectedProxy.url}${encodeURIComponent(fullUrl)}`;
        console.log('プロキシURL:', proxyUrl);
        
        // 直接Axiosでリクエスト
        const directResponse = await axios.get(proxyUrl);
        console.log('プロキシ経由で成功:', directResponse);
        
        if (directResponse.data) {
          setPrompts(directResponse.data);
          setError(null);
        } else {
          throw new Error('無効なレスポンスデータ');
        }
      } catch (err) {
        console.error('プロンプト取得エラー:', err);
        
        // プロキシインデックスを変更
        const currentIndex = parseInt(localStorage.getItem('cors_proxy_index') || '0', 10);
        const nextIndex = (currentIndex + 1) % CORS_PROXIES.length;
        localStorage.setItem('cors_proxy_index', nextIndex.toString());
        
        setError('プロンプトの取得中にエラーが発生しました。再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [filters, searchQuery]);

  // フィルターとソートを適用したプロンプトリスト
  const filteredPrompts = prompts;

  // フィルター変更ハンドラー
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">プロンプトを探す</h1>
        <div className="text-sm text-gray-500">
          接続: 
          {loading ? (
            <span className="ml-1 text-yellow-500">取得中...</span>
          ) : error ? (
            <span className="ml-1 text-red-500">エラー</span>
          ) : (
            <span className="ml-1 text-green-500">成功 (プロキシ #{localStorage.getItem('cors_proxy_index') || '0'})</span>
          )}
        </div>
      </div>
      
      {/* 検索・フィルターセクション */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="プロンプトを検索..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべてのカテゴリ</option>
              <option value="クリエイティブ">クリエイティブ</option>
              <option value="ビジネス">ビジネス</option>
              <option value="教育">教育</option>
              <option value="テクニカル">テクニカル</option>
              <option value="データ分析">データ分析</option>
              <option value="その他">その他</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用途</label>
            <select
              name="purpose"
              value={filters.purpose}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての用途</option>
              <option value="文章生成">文章生成</option>
              <option value="コード作成">コード作成</option>
              <option value="データ分析">データ分析</option>
              <option value="画像生成">画像生成</option>
              <option value="要約">要約</option>
              <option value="アイデア出し">アイデア出し</option>
              <option value="学習支援">学習支援</option>
              <option value="その他">その他</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="latest">新着順</option>
              <option value="popular">人気順</option>
              <option value="most_used">使用数順</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* プロンプトリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // ローディング表示
          <div className="col-span-3 flex justify-center py-8">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          // エラー表示
          <div className="col-span-3 text-center py-8">
            <p className="text-red-500 text-lg">{error}</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button 
                onClick={() => {
                  // プロキシを切り替え
                  const currentIndex = parseInt(localStorage.getItem('cors_proxy_index') || '0', 10);
                  const nextIndex = (currentIndex + 1) % 3; // プロキシの数
                  localStorage.setItem('cors_proxy_index', nextIndex.toString());
                  console.log(`プロキシを変更: ${currentIndex} → ${nextIndex}`);
                  window.location.reload();
                }} 
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                別のプロキシで試す
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                再読み込み
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              現在のプロキシインデックス: {localStorage.getItem('cors_proxy_index') || '0'}
            </div>
          </div>
        ) : filteredPrompts.length > 0 ? (
          // プロンプトリスト表示
          filteredPrompts.map(prompt => (
            <div 
              key={prompt._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {prompt.category}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {prompt.purpose}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">
                  <Link to={`/prompt/${prompt._id}`} className="hover:text-blue-600">
                    {prompt.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {prompt.content.length > 200 
                    ? prompt.content.substring(0, 200) + '...' 
                    : prompt.content}
                </p>
                
                <p className="text-gray-600 text-sm mb-4">
                  作成者: <span className="font-medium">{prompt.user?.username || 'ユーザー'}</span>
                </p>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>{prompt.likes ? prompt.likes.length : 0}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{prompt.usageCount}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // 結果なしの表示
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500 text-lg">条件に一致するプロンプトが見つかりませんでした。</p>
            <p className="text-gray-500">フィルター条件を変更してみてください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;