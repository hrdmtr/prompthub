import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { promptService } from '../utils/api';
import useAuth from '../hooks/useAuth';

const EditPrompt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // フォームの状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    purpose: '',
    service: '',
    model: '',
    tags: ''
  });

  // UI状態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初期データの読み込み
  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        setLoading(true);
        // 削除済みの場合も表示できるように（自分のプロンプトの場合）
        const response = await promptService.getPromptById(id, true);
        const prompt = response.data;

        // 所有者チェック
        if (!isAuthenticated || !user || prompt.user._id !== user._id) {
          setError('このプロンプトを編集する権限がありません');
          setLoading(false);
          return;
        }

        // 削除済みの場合は通知
        if (prompt.isDeleted) {
          setError('このプロンプトは削除済みです。編集を保存すると復元されます。');
        }

        // データをフォームにセット
        setFormData({
          title: prompt.title || '',
          content: prompt.content || '',
          category: prompt.category || 'その他',
          purpose: prompt.purpose || 'その他',
          service: prompt.service || 'その他',
          model: prompt.model || '',
          tags: prompt.tags ? prompt.tags.join(', ') : ''
        });

        setLoading(false);
      } catch (err) {
        console.error('プロンプト取得エラー:', err);
        setError('プロンプトの読み込みに失敗しました');
        setLoading(false);
      }
    };

    fetchPromptData();
  }, [id, isAuthenticated, user]);

  // 入力変更ハンドラー
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 送信ハンドラー
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // タグを処理
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      // 更新データを準備
      const updateData = {
        ...formData,
        tags: tagsArray,
        isDeleted: false // 削除されていた場合は復元
      };
      
      // APIリクエスト
      await promptService.updatePrompt(id, updateData);
      
      setSuccess('プロンプトが更新されました');
      
      // 成功メッセージを表示後、詳細ページにリダイレクト
      setTimeout(() => {
        navigate(`/prompt/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error('プロンプト更新エラー:', err);
      setError('プロンプトの更新に失敗しました: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // キャンセルボタンのハンドラー
  const handleCancel = () => {
    navigate(`/prompt/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">プロンプトを編集</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error && !formData.title ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-2 text-blue-500 hover:underline"
          >
            前のページに戻る
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p>{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="プロンプトのタイトルを入力"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                プロンプト内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="10"
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="プロンプトの内容を入力"
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                実際に利用しているプロンプトをそのまま貼り付けてください。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">カテゴリを選択</option>
                  <option value="クリエイティブ">クリエイティブ</option>
                  <option value="ビジネス">ビジネス</option>
                  <option value="教育">教育</option>
                  <option value="テクニカル">テクニカル</option>
                  <option value="データ分析">データ分析</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="purpose" className="block text-gray-700 font-medium mb-2">
                  用途 <span className="text-red-500">*</span>
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">用途を選択</option>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="service" className="block text-gray-700 font-medium mb-2">
                  使用サービス
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="OpenAI">OpenAI (ChatGPT)</option>
                  <option value="Anthropic">Anthropic (Claude)</option>
                  <option value="Google">Google (Gemini)</option>
                  <option value="Microsoft">Microsoft (Copilot)</option>
                  <option value="Stability AI">Stability AI</option>
                  <option value="Midjourney">Midjourney</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="model" className="block text-gray-700 font-medium mb-2">
                  使用モデル
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: GPT-4, Claude 3 Opusなど"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
                タグ
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="カンマ区切りでタグを入力（例: プログラミング, Python, AI）"
              />
              <p className="text-sm text-gray-500 mt-1">
                関連するキーワードをカンマで区切って入力してください。検索時に使用されます。
              </p>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                キャンセル
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? '更新中...' : '更新する'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default EditPrompt;