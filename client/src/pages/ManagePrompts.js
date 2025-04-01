import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { promptService, authService } from '../utils/api';
import useAuth from '../hooks/useAuth';

const ManagePrompts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // 状態の定義
  const [activePrompts, setActivePrompts] = useState([]);
  const [deletedPrompts, setDeletedPrompts] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingDeleted, setLoadingDeleted] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [message, setMessage] = useState(null);
  
  // ユーザーのプロンプトを取得
  useEffect(() => {
    // 未認証の場合はログインページにリダイレクト
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/manage-prompts' } });
      return;
    }
    
    const fetchPrompts = async () => {
      try {
        setError(null);
        
        // アクティブなプロンプト（非削除）を取得
        setLoadingActive(true);
        const activeResponse = await promptService.getPrompts({ user: user._id });
        setActivePrompts(activeResponse.data);
        setLoadingActive(false);
        
        // 削除済みプロンプトを取得
        setLoadingDeleted(true);
        const userResponse = await authService.getCurrentUser();
        const userPromptIds = userResponse.data.prompts || [];
        
        // すべてのプロンプトIDから現在表示されているアクティブなものを除外して、
        // それらが削除されたものと判断する
        const activeIds = new Set(activeResponse.data.map(p => p._id));
        const potentiallyDeletedIds = userPromptIds.filter(id => !activeIds.has(id));
        
        // 削除済みプロンプトの詳細を取得
        const deletedPromptsData = [];
        for (const promptId of potentiallyDeletedIds) {
          try {
            const response = await promptService.getPromptById(promptId, true);
            const prompt = response.data;
            if (prompt && prompt.isDeleted) {
              deletedPromptsData.push(prompt);
            }
          } catch (err) {
            console.error(`削除済みプロンプト取得エラー (ID: ${promptId}):`, err);
          }
        }
        
        setDeletedPrompts(deletedPromptsData);
        setLoadingDeleted(false);
      } catch (err) {
        console.error('プロンプト取得エラー:', err);
        setError('プロンプトの読み込みに失敗しました');
        setLoadingActive(false);
        setLoadingDeleted(false);
      }
    };
    
    fetchPrompts();
  }, [isAuthenticated, user, navigate]);
  
  // プロンプト削除処理
  const handleDelete = async (id) => {
    try {
      setActionInProgress(id);
      setMessage(null);
      
      await promptService.deletePrompt(id);
      
      // 削除したプロンプトを状態から移動
      const deletedPrompt = activePrompts.find(p => p._id === id);
      if (deletedPrompt) {
        deletedPrompt.isDeleted = true;
        deletedPrompt.deletedAt = new Date();
        setActivePrompts(activePrompts.filter(p => p._id !== id));
        setDeletedPrompts([...deletedPrompts, deletedPrompt]);
      }
      
      setMessage({ type: 'success', text: 'プロンプトを削除しました' });
    } catch (err) {
      console.error('プロンプト削除エラー:', err);
      setMessage({ type: 'error', text: '削除に失敗しました' });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // プロンプト復元処理
  const handleRestore = async (id) => {
    try {
      setActionInProgress(id);
      setMessage(null);
      
      await promptService.restorePrompt(id);
      
      // 復元したプロンプトを状態から移動
      const restoredPrompt = deletedPrompts.find(p => p._id === id);
      if (restoredPrompt) {
        restoredPrompt.isDeleted = false;
        restoredPrompt.deletedAt = null;
        setDeletedPrompts(deletedPrompts.filter(p => p._id !== id));
        setActivePrompts([...activePrompts, restoredPrompt]);
      }
      
      setMessage({ type: 'success', text: 'プロンプトを復元しました' });
    } catch (err) {
      console.error('プロンプト復元エラー:', err);
      setMessage({ type: 'error', text: '復元に失敗しました' });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // 日付フォーマット関数
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">プロンプト管理</h1>
        <Link
          to="/create"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          新規作成
        </Link>
      </div>
      
      {message && (
        <div 
          className={`p-4 mb-6 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'active'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('active')}
          >
            アクティブ ({activePrompts.length})
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'deleted'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('deleted')}
          >
            削除済み ({deletedPrompts.length})
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'active' ? (
            <>
              {loadingActive ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : activePrompts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">作成したプロンプトはありません</p>
                  <Link
                    to="/create"
                    className="text-blue-500 hover:underline"
                  >
                    新しいプロンプトを作成する
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          タイトル
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          カテゴリ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          作成日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用回数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activePrompts.map((prompt) => (
                        <tr key={prompt._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/prompt/${prompt._id}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {prompt.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {prompt.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(prompt.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {prompt.usageCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                to={`/edit-prompt/${prompt._id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                編集
                              </Link>
                              <button
                                onClick={() => handleDelete(prompt._id)}
                                disabled={actionInProgress === prompt._id}
                                className="text-red-600 hover:text-red-900 ml-3"
                              >
                                {actionInProgress === prompt._id ? '処理中...' : '削除'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              {loadingDeleted ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : deletedPrompts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>削除したプロンプトはありません</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          タイトル
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          カテゴリ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          削除日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deletedPrompts.map((prompt) => (
                        <tr key={prompt._id} className="bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {prompt.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {prompt.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(prompt.deletedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleRestore(prompt._id)}
                              disabled={actionInProgress === prompt._id}
                              className="text-green-600 hover:text-green-900"
                            >
                              {actionInProgress === prompt._id ? '処理中...' : '復元'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePrompts;