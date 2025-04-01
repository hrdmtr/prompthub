import React from 'react';

// TwitterシェアボタンコンポーネントX（旧Twitter）
export const TwitterShareButton = ({ url, title, hashtags = [], children }) => {
  const handleClick = () => {
    // ハッシュタグを#付きにフォーマット
    const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag.substring(1) : tag).join(',');
    
    // Twitterシェア用URL作成
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.append('url', url);
    shareUrl.searchParams.append('text', title);
    if (formattedHashtags) {
      shareUrl.searchParams.append('hashtags', formattedHashtags);
    }
    
    // 新しいウィンドウでTwitterシェア画面を開く
    window.open(shareUrl.toString(), '_blank', 'width=550,height=420');
  };
  
  return (
    <button 
      onClick={handleClick}
      className="flex items-center justify-center p-2 bg-[#1DA1F2] hover:bg-[#0c85d0] text-white rounded-md transition-colors"
      aria-label="Twitterでシェア"
    >
      {children || (
        <>
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
          <span>ポスト</span>
        </>
      )}
    </button>
  );
};

// LINEシェアボタンコンポーネント
export const LineShareButton = ({ url, title, children }) => {
  const handleClick = () => {
    // LINEシェア用URL作成
    const shareUrl = new URL('https://social-plugins.line.me/lineit/share');
    
    // テキストとURLを結合
    const message = `${title}\n${url}`;
    shareUrl.searchParams.append('text', message);
    
    // 新しいウィンドウでLINEシェア画面を開く
    window.open(shareUrl.toString(), '_blank', 'width=550,height=550');
  };
  
  return (
    <button 
      onClick={handleClick}
      className="flex items-center justify-center p-2 bg-[#06C755] hover:bg-[#05a748] text-white rounded-md transition-colors"
      aria-label="LINEでシェア"
    >
      {children || (
        <>
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 448 512">
            <path d="M272.1 204.2v71.1c0 1.8-1.4 3.2-3.2 3.2h-11.4c-1.1 0-2.1-.6-2.6-1.3l-32.6-44v42.2c0 1.8-1.4 3.2-3.2 3.2h-11.4c-1.8 0-3.2-1.4-3.2-3.2v-71.1c0-1.8 1.4-3.2 3.2-3.2H219c1 0 2.1.5 2.6 1.4l32.6 44v-42.2c0-1.8 1.4-3.2 3.2-3.2h11.4c1.8-.1 3.3 1.4 3.3 3.1zm-82-3.2h-11.4c-1.8 0-3.2 1.4-3.2 3.2v71.1c0 1.8 1.4 3.2 3.2 3.2h11.4c1.8 0 3.2-1.4 3.2-3.2v-71.1c0-1.7-1.4-3.2-3.2-3.2zm-27.5 59.6h-31.1v-56.4c0-1.8-1.4-3.2-3.2-3.2h-11.4c-1.8 0-3.2 1.4-3.2 3.2v71.1c0 .9.3 1.6.9 2.2.6.5 1.3.9 2.2.9h45.7c1.8 0 3.2-1.4 3.2-3.2v-11.4c0-1.7-1.4-3.2-3.1-3.2zM332.1 201h-45.7c-1.7 0-3.2 1.4-3.2 3.2v71.1c0 1.7 1.4 3.2 3.2 3.2h45.7c1.8 0 3.2-1.4 3.2-3.2v-11.4c0-1.8-1.4-3.2-3.2-3.2H301v-12h31.1c1.8 0 3.2-1.4 3.2-3.2V234c0-1.8-1.4-3.2-3.2-3.2H301v-12h31.1c1.8 0 3.2-1.4 3.2-3.2v-11.4c-.1-1.7-1.5-3.2-3.2-3.2zM448 113.7V399c-.1 44.8-36.8 81.1-81.7 81H81c-44.8-.1-81.1-36.9-81-81.7V113c.1-44.8 36.9-81.1 81.7-81H367c44.8.1 81.1 36.8 81 81.7zm-61.6 122.6c0-73-73.2-132.4-163.1-132.4-89.9 0-163.1 59.4-163.1 132.4 0 65.4 58 120.2 136.4 130.6 19.1 4.1 16.9 11.1 12.6 36.8-.7 4.1-3.3 16.1 14.1 8.8 17.4-7.3 93.9-55.3 128.2-94.7 23.6-26 34.9-52.3 34.9-81.5z"/>
          </svg>
          <span>LINE</span>
        </>
      )}
    </button>
  );
};

// 共有用URLと情報のフォーマット関数
export const formatShareContent = (prompt, baseUrl) => {
  if (!prompt) return { url: '', title: '', hashtags: [] };
  
  // ベースURLがない場合は現在のURLを使用
  const url = baseUrl || window.location.href;
  
  // タイトルとプロンプトの冒頭を含める（文字数制限あり）
  const titlePrefix = 'PromptHubでプロンプトを共有: ';
  const title = `${titlePrefix}${prompt.title}`;
  
  // ハッシュタグ設定
  const hashtags = ['PromptHub'];
  
  // プロンプトにタグがある場合は追加
  if (prompt.tags && Array.isArray(prompt.tags) && prompt.tags.length > 0) {
    // 最大3つまでタグを追加
    prompt.tags.slice(0, 3).forEach(tag => {
      hashtags.push(tag);
    });
  }
  
  // カテゴリとサービスをハッシュタグとして追加
  if (prompt.category) hashtags.push(prompt.category);
  if (prompt.service && prompt.service !== 'その他') hashtags.push(prompt.service);
  
  return { url, title, hashtags };
};