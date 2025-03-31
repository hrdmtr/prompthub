import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-4xl font-bold mt-4 mb-8">ページが見つかりません</h2>
        <p className="text-lg text-gray-600 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg inline-block"
        >
          ホームに戻る
        </Link>
      </div>
      
      <div className="mt-16 max-w-md text-center">
        <h3 className="text-xl font-semibold mb-4">お探しのものは以下かもしれません：</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/explore" className="text-blue-600 hover:text-blue-800">
              プロンプトを探す
            </Link>
          </li>
          <li>
            <Link to="/create" className="text-blue-600 hover:text-blue-800">
              新しいプロンプトを作成する
            </Link>
          </li>
          <li>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              アカウントにログインする
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotFound;