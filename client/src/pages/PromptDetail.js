import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const PromptDetail = () => {
  const { id } = useParams();
  const [commentInput, setCommentInput] = useState('');
  
  // プロンプトデータ（後でAPIから取得するように置き換えます）
  const [prompt, setPrompt] = useState({
    id: parseInt(id),
    title: 'コードレビューアシスタント',
    content: 
`以下のコードをレビューしてください。

1. バグや潜在的な問題点を指摘する
2. パフォーマンスの最適化ポイントを示す
3. コードの可読性や保守性を向上させる提案をする
4. セキュリティ上の懸念がある場合は警告する
5. コーディング規約に準拠しているかチェックする

レビュー対象のコード:
\`\`\`{{language}}
{{code}}
\`\`\`

コードの改善例も提示してください。`,
    category: 'テクニカル',
    purpose: 'コード作成',
    user: {
      id: 1,
      username: 'senior_dev',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    tags: ['コードレビュー', 'プログラミング', '最適化'],
    likes: 631,
    isSaved: false,
    isLiked: false,
    usageCount: 1842,
    date: '2023-09-20',
    comments: [
      {
        id: 1,
        user: {
          id: 2,
          username: 'code_ninja',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        content: 'セキュリティの観点からのレビューも非常に役立ちます。特にAPIキーなどの機密情報の扱いに関するチェックが素晴らしいです。',
        date: '2023-10-05',
        likes: 12
      },
      {
        id: 2,
        user: {
          id: 3,
          username: 'dev_learner',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
        },
        content: 'このプロンプトを使って自分のコードをレビューしてもらったところ、多くの改善点を指摘してもらえました。特にパフォーマンス面での提案が具体的で助かりました。',
        date: '2023-09-28',
        likes: 8
      }
    ]
  });

  // コメント送信ハンドラー
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    // 新しいコメントを追加（後でAPIと連携）
    const newComment = {
      id: prompt.comments.length + 1,
      user: {
        id: 4, // ログインユーザーID
        username: 'current_user', // ログインユーザー名
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg' // ログインユーザーアバター
      },
      content: commentInput,
      date: new Date().toISOString().split('T')[0], // 今日の日付
      likes: 0
    };
    
    setPrompt({
      ...prompt,
      comments: [newComment, ...prompt.comments]
    });
    setCommentInput('');
  };

  // いいねトグルハンドラー
  const toggleLike = () => {
    setPrompt({
      ...prompt,
      isLiked: !prompt.isLiked,
      likes: prompt.isLiked ? prompt.likes - 1 : prompt.likes + 1
    });
  };

  // 保存トグルハンドラー
  const toggleSave = () => {
    setPrompt({
      ...prompt,
      isSaved: !prompt.isSaved
    });
  };

  // 使用カウント増加ハンドラー
  const incrementUsage = () => {
    setPrompt({
      ...prompt,
      usageCount: prompt.usageCount + 1
    });
    // ここでAPIを呼び出して使用カウントを更新
  };

  // プロンプトコピーハンドラー
  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt.content);
    alert('プロンプトをクリップボードにコピーしました');
    incrementUsage();
  };

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
              <img 
                src={prompt.user.avatar} 
                alt={prompt.user.username} 
                className="w-10 h-10 rounded-full mr-3" 
              />
              <div>
                <p className="font-medium">{prompt.user.username}</p>
                <p className="text-gray-500 text-sm">{prompt.date}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={toggleSave}
                className={`p-2 rounded-full ${prompt.isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} hover:bg-blue-100 hover:text-blue-600`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
              <button 
                onClick={toggleLike}
                className={`p-2 rounded-full ${prompt.isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-red-100 hover:text-red-600`}
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
            {prompt.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
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
                <span>{prompt.likes} いいね</span>
              </div>
              <div className="flex items-center text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>{prompt.usageCount} 回使用</span>
              </div>
              <div className="flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{prompt.comments.length} コメント</span>
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
                disabled={!commentInput.trim()}
              >
                コメントを投稿
              </button>
            </div>
          </form>
          
          <div className="space-y-6">
            {prompt.comments.length > 0 ? (
              prompt.comments.map(comment => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start">
                    <img 
                      src={comment.user.avatar} 
                      alt={comment.user.username} 
                      className="w-10 h-10 rounded-full mr-3" 
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium">{comment.user.username}</p>
                        <p className="text-gray-500 text-sm">{comment.date}</p>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <button className="flex items-center hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>{comment.likes} いいね</span>
                        </button>
                      </div>
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
      
      {/* 類似プロンプト推奨セクション（後で実装予定） */}
    </div>
  );
};

export default PromptDetail;