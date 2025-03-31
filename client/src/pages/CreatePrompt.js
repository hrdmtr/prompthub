import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '../utils/api';
import useAuth from '../hooks/useAuth';

const CreatePrompt = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  const [promptData, setPromptData] = useState({
    title: '',
    content: '',
    category: '',
    purpose: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // 認証状態をチェック
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: '/create', message: 'プロンプトを作成するにはログインが必要です' } });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e) => {
    setPromptData({
      ...promptData,
      [e.target.name]: e.target.value
    });
    
    // エラーをクリア
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !promptData.tags.includes(tagInput.trim())) {
      setPromptData({
        ...promptData,
        tags: [...promptData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setPromptData({
      ...promptData,
      tags: promptData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 入力検証
    const newErrors = {};
    if (!promptData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    if (!promptData.content.trim()) {
      newErrors.content = 'プロンプト内容は必須です';
    }
    if (!promptData.category) {
      newErrors.category = 'カテゴリは必須です';
    }
    if (!promptData.purpose) {
      newErrors.purpose = '用途は必須です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      // APIにプロンプトデータを送信
      const response = await promptService.createPrompt(promptData);
      console.log('作成されたプロンプト:', response.data);
      
      // 成功時の処理
      navigate(`/prompt/${response.data._id}`); // 作成されたプロンプト詳細ページにリダイレクト
    } catch (error) {
      console.error('プロンプト作成エラー:', error);
      setApiError(
        error.response?.data?.message || 'プロンプトの作成中にエラーが発生しました。後でもう一度お試しください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">新しいプロンプトを作成</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={promptData.title}
              onChange={handleChange}
              placeholder="プロンプトのタイトルを入力"
              className={`w-full p-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={promptData.category}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">カテゴリを選択...</option>
                <option value="クリエイティブ">クリエイティブ</option>
                <option value="ビジネス">ビジネス</option>
                <option value="教育">教育</option>
                <option value="テクニカル">テクニカル</option>
                <option value="データ分析">データ分析</option>
                <option value="その他">その他</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>
            
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                用途 <span className="text-red-500">*</span>
              </label>
              <select
                id="purpose"
                name="purpose"
                value={promptData.purpose}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${errors.purpose ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">用途を選択...</option>
                <option value="文章生成">文章生成</option>
                <option value="コード作成">コード作成</option>
                <option value="データ分析">データ分析</option>
                <option value="画像生成">画像生成</option>
                <option value="要約">要約</option>
                <option value="アイデア出し">アイデア出し</option>
                <option value="学習支援">学習支援</option>
                <option value="その他">その他</option>
              </select>
              {errors.purpose && <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              プロンプト内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={promptData.content}
              onChange={handleChange}
              placeholder="プロンプトの内容を入力..."
              rows="10"
              className={`w-full p-3 border rounded-lg ${errors.content ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            ></textarea>
            {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            <p className="mt-2 text-sm text-gray-500">
              変数には {'{{変数名}}'} のような形式を使うことをお勧めします
            </p>
          </div>
          
          <div className="mb-8">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              タグ
            </label>
            <div className="flex">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="タグを入力してEnterキーを押す"
                className="flex-grow p-3 border rounded-l-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg"
              >
                追加
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {promptData.tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1.5 rounded flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1.5 text-blue-800 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : 'プロンプトを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrompt;