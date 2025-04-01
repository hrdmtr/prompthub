/**
 * このスクリプトは、現在のビルド情報を環境変数として設定します。
 * React Scriptsのビルドプロセスで自動的に実行されます。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 現在のGitコミットハッシュを取得
let commitId = 'unknown';
try {
  // Renderなどの環境ではGitコマンドが使えない場合があるので環境変数も試す
  if (process.env.RENDER_GIT_COMMIT) {
    commitId = process.env.RENDER_GIT_COMMIT.substring(0, 7);
  } else {
    commitId = execSync('git rev-parse --short HEAD').toString().trim();
  }
} catch (error) {
  console.warn('Git commit idの取得に失敗しました:', error.message);
}

// ビルド情報
const buildInfo = {
  REACT_APP_VERSION: process.env.npm_package_version || '0.1.0',
  REACT_APP_BUILD_DATE: new Date().toISOString(),
  REACT_APP_COMMIT_ID: commitId,
  REACT_APP_BUILD_NUMBER: process.env.BUILD_NUMBER || Date.now().toString()
};

// 環境変数として設定
Object.entries(buildInfo).forEach(([key, value]) => {
  process.env[key] = value;
});

// 本番環境では.env.localファイルの書き込みをスキップ
if (process.env.NODE_ENV !== 'production') {
  try {
    // .env.localファイルに書き込む（次回のビルドでも使用可能に）
    const envContent = Object.entries(buildInfo)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const envPath = path.resolve(__dirname, '../.env.local');
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (error) {
    console.warn('.env.localファイルの書き込みに失敗しました:', error.message);
  }
}

console.log('ビルド情報を設定しました:');
console.table(buildInfo);