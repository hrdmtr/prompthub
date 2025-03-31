import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { promptService, userService } from '../utils/api';
import useAuth from '../hooks/useAuth';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [commentInput, setCommentInput] = useState('');
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // プロンプトデータをAPIから取得
  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        setLoading(true);
        const response = await promptService.getPromptById(id);
        setPrompt(response.data);
        
        // ログインしている場合、いいね状態を確認
        if (isAuthenticated && user) {
          setIsLiked(response.data.likes.includes(user._id));
          
          // ユーザーの保存状態を確認
          const userResponse = await userService.getCurrentUser();
          setIsSaved(userResponse.data.savedPrompts.includes(id));
        }
        
        setError(null);
      } catch (err) {
        console.error('プロンプト取得エラー:', err);
        setError('プロンプトの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPromptData();
    }
  }, [id, isAuthenticated, user]);
  
  // コメント送信ハンドラー
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/prompt/${id}`, message: 'コメントを投稿するにはログインが必要です' } });
      return;
    }
    
    try {
      const response = await promptService.addComment(id, commentInput);
      
      // APIからの応答でプロンプトのコメントを更新
      setPrompt({
        ...prompt,
        comments: response.data
      });
      
      setCommentInput('');
    } catch (error) {
      console.error('コメント投稿エラー:', error);
      alert('コメントの投稿に失敗しました。後でもう一度お試しください。');
    }
  };

  // いいねトグルハンドラー
  const toggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/prompt/${id}`, message: 'いいねするにはログインが必要です' } });
      return;
    }
    
    try {
      const response = await promptService.toggleLike(id);
      
      // APIからの応答でいいね状態を更新
      setPrompt({
        ...prompt,
        likes: response.data.likes
      });
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('いいねエラー:', error);
      alert('いいねの処理に失敗しました。後でもう一度お試しください。');
    }
  };

  // 保存トグルハンドラー
  const toggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/prompt/${id}`, message: 'プロンプトを保存するにはログインが必要です' } });
      return;
    }
    
    try {
      const response = await userService.toggleSavePrompt(id);
      
      // 保存状態を更新
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('保存エラー:', error);
      alert('プロンプトの保存に失敗しました。後でもう一度お試しください。');
    }
  };

  // 使用カウント増加ハンドラー
  const incrementUsage = async () => {
    try {
      const response = await promptService.incrementUsage(id);
      
      // APIからの応答で使用回数を更新
      setPrompt({
        ...prompt,
        usageCount: response.data.usageCount
      });
    } catch (error) {
      console.error('使用カウント更新エラー:', error);
    }
  };

  // プロンプトコピーハンドラー
  const copyPrompt = () => {
    if (prompt && prompt.content) {
      navigator.clipboard.writeText(prompt.content);
      alert('プロンプトをクリップボードにコピーしました');
      incrementUsage();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-12">
        <div className="animate-spin h-10 w-10 text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }
  
  if (error || !prompt) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">エラー</p>
          <p>{error || 'プロンプトが見つかりませんでした'}</p>
        </div>
        <Link to="/explore" className="text-blue-600 hover:text-blue-800">
          探索ページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/explore" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          探索に戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full mr-3 bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {prompt.user?.username ? prompt.user.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <p className="font-medium">{prompt.user?.username || 'ユーザー'}</p>
                <p className="text-gray-500 text-sm">{new Date(prompt.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={toggleSave}
                className={`p-2 rounded-full ${isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-100 hover:text-blue-600`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
              <button 
                onClick={toggleLike}
                className={`p-2 rounded-full ${isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-red-100 hover:text-red-600`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{prompt.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {prompt.category}
            </span>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {prompt.purpose}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {prompt.tags && prompt.tags.length > 0 ? (
              prompt.tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))
            ) : null}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6 whitespace-pre-wrap font-mono text-sm">
            {prompt.content}
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>{prompt.likes ? prompt.likes.length : 0} いいね</span>
              </div>
              <div className="flex items-center text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>{prompt.usageCount || 0} 回使用</span>
              </div>
              <div className="flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{prompt.comments ? prompt.comments.length : 0} コメント</span>
              </div>
            </div>
            
            <button
              onClick={copyPrompt}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
              使用する
            </button>
          </div>
        </div>
      </div>
      
      {/* コメントセクション */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">コメント</h2>
          
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="このプロンプトについてコメントする..."
              className="w-full p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
              rows="3"
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                disabled={!commentInput.trim() || !isAuthenticated}
              >
                {isAuthenticated ? 'コメントを投稿' : 'ログインしてコメントする'}
              </button>
            </div>
          </form>
          
          <div className="space-y-6">
            {prompt.comments && prompt.comments.length > 0 ? (
              prompt.comments.map(comment => (
                <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full mr-3 bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {comment.userId?.username ? comment.userId.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">{comment.userId?.username || 'ユーザー'}</p>
                        <p className="text-gray-500 text-sm">{new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">まだコメントはありません。最初のコメントを投稿しましょう！</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetail;