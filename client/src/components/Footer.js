import React from 'react';
import { Link } from 'react-router-dom';

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
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PromptHub. All rights reserved.
          </p>
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