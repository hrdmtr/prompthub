import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Explore = () => {
  // フィルター状態
  const [filters, setFilters] = useState({
    category: 'all',
    purpose: 'all',
    sort: 'latest'
  });

  // 検索クエリ状態
  const [searchQuery, setSearchQuery] = useState('');

  // ダミーデータ（後でAPIから取得するように置き換えます）
  const dummyPrompts = [
    {
      id: 1,
      title: 'ウェブサイト分析プロンプト',
      description: 'ウェブサイトのSEO分析とユーザビリティの改善案を提案するためのプロンプト',
      category: 'テクニカル',
      purpose: 'データ分析',
      user: 'tech_expert',
      likes: 542,
      usage: 1203,
      date: '2023-10-15'
    },
    {
      id: 2,
      title: 'ビジネスプラン作成アシスタント',
      description: 'スタートアップのビジネスプランを段階的に作成するためのプロンプト',
      category: 'ビジネス',
      purpose: 'アイデア出し',
      user: 'entrepreneur',
      likes: 328,
      usage: 890,
      date: '2023-10-10'
    },
    {
      id: 3,
      title: '小説のプロット展開ヘルパー',
      description: '小説のストーリー構成やキャラクター設定を支援するプロンプト',
      category: 'クリエイティブ',
      purpose: '文章生成',
      user: 'novelist',
      likes: 417,
      usage: 762,
      date: '2023-10-05'
    },
    {
      id: 4,
      title: '数学の問題解説ジェネレーター',
      description: '数学の問題を段階的に解説し、視覚的な説明を含めるプロンプト',
      category: '教育',
      purpose: '学習支援',
      user: 'math_teacher',
      likes: 289,
      usage: 1567,
      date: '2023-09-28'
    },
    {
      id: 5,
      title: 'コードレビューアシスタント',
      description: 'コードのバグや最適化の可能性を指摘し、改善案を提案するプロンプト',
      category: 'テクニカル',
      purpose: 'コード作成',
      user: 'senior_dev',
      likes: 631,
      usage: 1842,
      date: '2023-09-20'
    },
    {
      id: 6,
      title: 'マーケティングコピーライティング支援',
      description: '効果的な広告コピーやキャッチフレーズを生成するためのプロンプト',
      category: 'ビジネス',
      purpose: '文章生成',
      user: 'marketing_pro',
      likes: 458,
      usage: 1203,
      date: '2023-09-15'
    }
  ];

  // フィルターとソートを適用したプロンプトリスト
  const filteredPrompts = dummyPrompts.filter(prompt => {
    // カテゴリフィルター
    if (filters.category !== 'all' && prompt.category !== filters.category) {
      return false;
    }
    // 用途フィルター
    if (filters.purpose !== 'all' && prompt.purpose !== filters.purpose) {
      return false;
    }
    // 検索クエリ
    if (searchQuery && !prompt.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    // ソート
    switch (filters.sort) {
      case 'popular':
        return b.likes - a.likes;
      case 'most_used':
        return b.usage - a.usage;
      case 'latest':
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  // フィルター変更ハンドラー
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">プロンプトを探す</h1>
      
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
        {filteredPrompts.length > 0 ? (
          filteredPrompts.map(prompt => (
            <div 
              key={prompt.id}
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
                  <Link to={`/prompt/${prompt.id}`} className="hover:text-blue-600">
                    {prompt.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {prompt.description}
                </p>
                
                <p className="text-gray-600 text-sm mb-4">
                  作成者: <span className="font-medium">{prompt.user}</span>
                </p>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>{prompt.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{prompt.usage}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{prompt.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
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