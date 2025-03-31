import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '../utils/api';

const Home = () => {
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // APIからプロンプトを取得
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const response = await promptService.getPrompts({ sort: 'popular', limit: 3 });
        setFeaturedPrompts(response.data);
        setError(null);
      } catch (err) {
        console.error('プロンプト取得エラー:', err);
        setError('プロンプトの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompts();
  }, []);

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AIプロンプトの共有コミュニティへようこそ
          </h1>
          <p className="text-xl mb-8">
            PromptHubで最高のAIプロンプトを発見、共有、改善しましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explore"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg"
            >
              プロンプトを探す
            </Link>
            <Link
              to="/create"
              className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-lg font-medium text-lg"
            >
              プロンプトを作成する
            </Link>
          </div>
        </div>
      </section>

      {/* 注目のプロンプト */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">注目のプロンプト</h2>
          <Link to="/explore" className="text-blue-600 hover:text-blue-800">
            もっと見る →
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-10 w-10 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : featuredPrompts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">まだプロンプトがありません。最初のプロンプトを作成しましょう！</p>
            <Link to="/create" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              プロンプトを作成する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrompts.map(prompt => (
              <div 
                key={prompt._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {prompt.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">
                    <Link to={`/prompt/${prompt._id}`} className="hover:text-blue-600">
                      {prompt.title}
                    </Link>
                  </h3>
                  
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
                      <span>{prompt.usageCount || 0}</span>
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
            ))}
          </div>
        )}
      </section>

      {/* 機能紹介 */}
      <section className="bg-gray-100 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">PromptHubでできること</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">プロンプトを発見</h3>
            <p className="text-gray-600">
              様々なカテゴリや目的に応じた高品質なAIプロンプトを見つけられます
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">フィードバックを共有</h3>
            <p className="text-gray-600">
              プロンプトへのコメントや改善案を共有して、コミュニティに貢献できます
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">プロンプトを作成</h3>
            <p className="text-gray-600">
              あなたのプロンプトを共有し、コミュニティからフィードバックを得られます
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          今すぐ始めましょう
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          PromptHubに参加して、AIとの対話をより良くするプロンプトを発見し、共有しましょう
        </p>
        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg inline-block"
        >
          無料で登録する
        </Link>
      </section>
    </div>
  );
};

export default Home;