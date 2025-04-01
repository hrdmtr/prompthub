// server.js - バックエンドAPI
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const promptRoutes = require('./routes/promptRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// 環境変数の読み込み
dotenv.config();

// 環境変数の検証
console.log('環境変数検証:');
console.log('- NODE_ENV:', process.env.NODE_ENV || '未設定');
console.log('- PORT:', process.env.PORT || '未設定 (デフォルト: 5001)');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '設定済み' : '未設定 (デフォルト: localhost)');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '設定済み' : '未設定 (警告: セキュリティリスク)');

const app = express();
const PORT = process.env.PORT || 5001;

// すべてのリクエストに対してCORSヘッダーを設定する特殊ミドルウェア（最優先）
app.use((req, res, next) => {
  // CORSヘッダーを無条件に設定
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  
  // OPTIONSリクエストに即座に応答
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 通常のCORS設定（念のため残しておく）
app.use(cors({
  origin: '*', // すべてのオリジンからのリクエストを許可
  credentials: false, // CORSをシンプルにするために無効化
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
}));

// 静的ファイルへのアクセスをデバッグ
app.use((req, res, next) => {
  if (req.path.startsWith('/static/')) {
    console.log('Static file request:', req.path);
  }
  next();
});

// シンプルなリクエストログと追加のデバッグ情報
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  
  // リクエストヘッダーの詳細（デバッグ用）
  console.log('Request headers:', JSON.stringify(req.headers));
  
  // すでに設定されたレスポンスヘッダーを確認（デバッグ用）
  console.log('Current response headers:', res._headers || 'not available');
  
  next();
});
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB接続（リトライロジック付き）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prompthub';

// 接続URL解析（オプションを含む完全な解析）
function parseMongoURI(uri) {
  try {
    // 基本パターン: mongodb(+srv)://username:password@host:port/database?options
    const sanitizedURI = uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
    
    // プロトコルの抽出
    const protocol = uri.startsWith('mongodb+srv') ? 'mongodb+srv' : 'mongodb';
    
    // ホスト部分の抽出
    const authAndHostMatch = uri.match(/@([^\/\?]+)/);
    const hostPart = authAndHostMatch ? authAndHostMatch[1] : '不明';
    
    // データベース名の抽出
    const dbMatch = uri.match(/\/([^\/\?]+)(\?|$)/);
    const dbName = dbMatch ? dbMatch[1] : '不明';
    
    // オプションの抽出
    const optionsMatch = uri.match(/\?(.+)$/);
    const options = optionsMatch ? optionsMatch[1] : 'なし';
    
    return {
      sanitizedURI,
      protocol,
      host: hostPart,
      database: dbName,
      options
    };
  } catch (e) {
    return { sanitizedURI: '解析エラー', protocol: '不明', host: '不明', database: '不明', options: '不明' };
  }
}

// 接続情報の詳細表示（安全な形式）
const uriDetails = parseMongoURI(MONGODB_URI);
console.log('MongoDB接続情報:');
console.log('- 安全なURI:', uriDetails.sanitizedURI);
console.log('- プロトコル:', uriDetails.protocol);
console.log('- ホスト:', uriDetails.host);
console.log('- データベース:', uriDetails.database);
console.log('- オプション:', uriDetails.options);

// リトライロジックの設定
const connectWithRetry = () => {
  console.log('MongoDB接続を試行中...');
  mongoose.connect(MONGODB_URI, {
    // 接続設定（タイムアウトなど）
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      
      // DNS解決テスト（接続先ホストが解決できるか確認）
      if (uriDetails.host !== '不明' && uriDetails.host !== 'localhost') {
        console.log(`ホスト ${uriDetails.host} のDNS解決を試みています...`);
        const dns = require('dns');
        dns.lookup(uriDetails.host.split(':')[0], (err, address, family) => {
          if (err) {
            console.error('DNS解決エラー:', err.message);
            console.log('ホスト名が正しいか、またはDNSが正常に機能しているか確認してください。');
          } else {
            console.log(`DNS解決成功: ${uriDetails.host} -> ${address} (IPv${family})`);
            console.log('DNSは正常ですが、他の接続問題（認証、ファイアウォール、ネットワーク）の可能性があります。');
          }
        });
      }
      
      // 接続文字列の検証
      if (!MONGODB_URI.includes('@') || !MONGODB_URI.includes('/')) {
        console.error('MongoDB接続文字列の形式が不正確な可能性があります。');
        console.log('正しい形式: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>');
      }
      
      console.log('5秒後に再接続を試みます...');
      // 5秒後に再接続
      setTimeout(connectWithRetry, 5000);
    });
};

// 接続開始
connectWithRetry();

// APIルート用のCORSミドルウェア（特に認証関連）
app.use('/api', (req, res, next) => {
  // API専用のCORSヘッダー
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for API endpoint:', req.url);
    return res.status(200).end();
  }
  
  next();
});

// テスト用の基本APIエンドポイント
app.get('/api/test', (req, res) => {
  // CORS関連のデバッグ情報を返す
  res.header('Access-Control-Allow-Origin', '*'); // 念のため再設定
  
  res.json({ 
    message: 'API is working!',
    cors: {
      origin: req.headers.origin || 'unknown',
      method: req.method,
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'content-type': res.getHeader('Content-Type'),
      headers: req.headers,
      responseHeaders: res._headers || 'not available'
    },
    time: new Date().toISOString()
  });
});

// CORS専用テストエンドポイント
app.all('/api/cors-test', (req, res) => {
  // 明示的なCORSヘッダーを設定
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  
  // メソッドに応じた処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // テスト結果を返す
  res.json({ 
    success: true, 
    message: 'CORS is working properly',
    method: req.method,
    requestOrigin: req.headers.origin || 'not provided',
    headers: req.headers,
    time: new Date().toISOString()
  });
});

// バージョン情報取得エンドポイント
app.get('/version', (req, res) => {
  // すべてのCORSオリジンを許可
  res.header('Access-Control-Allow-Origin', '*');
  
  // Gitのコミット情報を取得（可能な場合）
  let commitInfo = 'unknown';
  try {
    const { execSync } = require('child_process');
    commitInfo = execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    console.log('Git情報の取得に失敗:', error.message);
  }
  
  // バージョン情報を返す
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    server: {
      uptime: process.uptime(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      commit: commitInfo
    },
    nodejs: {
      version: process.version,
      platform: process.platform,
      memory: process.memoryUsage()
    },
    message: 'PromptHub API Version Information',
    features: {
      cors: true,
      authentication: true,
      proxies: true
    }
  });
});

// APIルートの設定
app.use('/api/prompts', promptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// デバッグ情報を表示
console.log('Current directory:', __dirname);
const fs = require('fs');

// 可能性のあるビルドパスをチェック（優先順位順）- Render環境に合わせて調整
console.log('Process working directory:', process.cwd());

const buildPaths = [
  path.join(__dirname, 'build'),                     // プロジェクトルート直下のbuild（最優先）
  path.join(process.cwd(), 'build'),                 // 現在の作業ディレクトリ直下のbuild
  path.join(__dirname, 'client/build'),              // client/build
  path.join(process.cwd(), 'client/build'),          // 現在の作業ディレクトリ/client/build
  '/app/build',                                      // Docker内の絶対パス
  '/app/client/build',                               // Docker内の絶対パス（クライアント）
  '/opt/render/project/src/build',                   // Render特有のパス
  '/opt/render/project/src/client/build'             // Render特有のパス
];

// 各パスの存在をチェック
buildPaths.forEach(p => {
  console.log(`Path check: ${p} - exists: ${fs.existsSync(p)}`);
  if (fs.existsSync(p)) {
    try {
      console.log(`Contents of ${p}:`, fs.readdirSync(p).slice(0, 10)); // 最初の10ファイルのみ表示
    } catch (e) {
      console.log(`Error reading ${p}:`, e.message);
    }
  }
});

// ディレクトリコンテンツも表示
console.log('Root directory contents:', fs.readdirSync(__dirname, { withFileTypes: true })
  .map(dirent => dirent.name));

// 最適なビルドパスを見つける
let clientBuildPath = null;
let indexHtmlPath = null;

for (const bp of buildPaths) {
  const indexPath = path.join(bp, 'index.html');
  if (fs.existsSync(indexPath)) {
    clientBuildPath = bp;
    indexHtmlPath = indexPath;
    console.log('Found build at:', clientBuildPath);
    break;
  }
}

// 見つからない場合はデフォルトを使用
if (!clientBuildPath) {
  console.log('No build directory found, using default path');
  clientBuildPath = path.resolve(__dirname, 'client/build');
  indexHtmlPath = path.resolve(__dirname, 'client/build/index.html');
}

// 本番環境ではReactアプリを提供
if (process.env.NODE_ENV === 'production') {
  // 緊急手段：最終手段として実行時にビルドファイルを作成
  if (!buildPaths.some(path => fs.existsSync(path))) {
    console.log('どのビルドパスも存在しません。緊急ビルド対策を実行します...');
    try {
      // レンダー環境特有のパス対策
      const { execSync } = require('child_process');
      
      // ビルドパスがない場合に手動でフォルダを作成
      console.log('mkdir -p build を実行...');
      execSync('mkdir -p build', { stdio: 'inherit' });
      
      // エントリーポイントの緊急対応
      console.log('緊急index.htmlファイルを作成...');
      const emergencyHtml = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PromptHub - Maintenance</title>
          <style>
            body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; }
            .message { background: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .refresh { background: #2563eb; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>PromptHub</h1>
          <div class="message">
            <p><strong>ビルド処理中...</strong></p>
            <p>アプリケーションは現在準備中です。数分後に再度アクセスしてください。</p>
          </div>
          <button class="refresh" onclick="window.location.reload()">更新</button>
          <p><small>Server time: ${new Date().toISOString()}</small></p>
        </body>
        </html>
      `;
      fs.writeFileSync(path.join(__dirname, 'build', 'index.html'), emergencyHtml);
      console.log('緊急index.htmlの作成完了');
    } catch (e) {
      console.error('緊急対策実行中にエラー:', e.message);
    }
  }
  
  // 複数の可能なディレクトリをチェック＆提供
  [clientBuildPath, path.join(__dirname, 'build')].forEach(buildPath => {
    if (fs.existsSync(buildPath)) {
      console.log('Serving static files from:', buildPath);
      app.use(express.static(buildPath));
    }
  });
  
  // すべてのルートをindexにリダイレクト
  app.get('*', (req, res) => {
    // APIリクエストは無視（404を返すようにする）
    if (req.path.startsWith('/api/')) {
      return res.status(404).send('API endpoint not found');
    }
    
    // リクエスト情報を詳細にログに記録
    console.log('Received client route request:', {
      path: req.path,
      originalUrl: req.originalUrl,
      headers: req.headers,
      query: req.query
    });
    
    // 複数の可能なindex.htmlの場所をチェック
    const possibleIndexPaths = [
      indexHtmlPath,
      path.join(__dirname, 'build/index.html'),
      path.join(__dirname, 'client/build/index.html'),
      path.join(process.cwd(), 'build/index.html'),
      path.join(process.cwd(), 'client/build/index.html'),
      // Render環境特有のパスも追加
      '/opt/render/project/src/build/index.html',
      '/opt/render/project/src/client/build/index.html'
    ];
    
    // 存在する最初のindex.htmlを提供
    for (const indexPath of possibleIndexPaths) {
      if (fs.existsSync(indexPath)) {
        console.log('Sending index.html from:', indexPath);
        return res.sendFile(indexPath);
      }
    }
    
    // 見つからない場合はエラーページ
    res.status(404).send(`
      <html>
        <head><title>PromptHub - Build Error</title></head>
        <body>
          <h1>Build files not found</h1>
          <p>The React build files could not be located. The server is running but the client files are missing.</p>
          <p>Checked paths:</p>
          <ul>${possibleIndexPaths.map(p => `<li>${p} - ${fs.existsSync(p) ? 'exists' : 'missing'}</li>`).join('')}</ul>
          <p>Server directory contents:</p>
          <ul>${fs.readdirSync(__dirname).map(file => `<li>${file}</li>`).join('')}</ul>
        </body>
      </html>
    `);
  });
}

// サーバー起動 - Render用にホストを設定
const HOST = process.env.HOST || '0.0.0.0';  // Renderでは0.0.0.0を使用（すべてのインターフェイスにバインド）
app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`RENDER: ${process.env.RENDER ? 'true' : 'false'}`);
});