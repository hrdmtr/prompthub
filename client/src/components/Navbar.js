import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <span>🤖 PromptHub</span>
        </Link>
        
        <div className="flex space-x-4 items-center">
          <Link to="/explore" className="hover:text-blue-200">
            探索
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create" className="hover:text-blue-200">
                作成
              </Link>
              
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                >
                  <span className="mr-1">{user?.username || 'ユーザー'}</span>
                  <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      プロフィール
                    </Link>
                    <Link 
                      to="/my-prompts" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      マイプロンプト
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">
                ログイン
              </Link>
              <Link to="/register" className="hover:text-blue-200">
                登録
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;