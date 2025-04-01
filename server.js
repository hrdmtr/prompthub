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

// ミドルウェア
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
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

// テスト用の基本APIエンドポイント
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// APIルートの設定
app.use('/api/prompts', promptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// デバッグ情報を表示
console.log('Current directory:', __dirname);
console.log('Looking for client/build at:', path.join(__dirname, 'client/build'));
console.log('File exists check:', require('fs').existsSync(path.join(__dirname, 'client/build')));
console.log('Directory contents:', require('fs').readdirSync(__dirname, { withFileTypes: true })
  .map(dirent => dirent.name));

// パスの確認
const clientBuildPath = path.resolve(__dirname, 'client/build');
const indexHtmlPath = path.resolve(__dirname, 'client/build/index.html');

// 本番環境ではReactアプリを提供
if (process.env.NODE_ENV === 'production') {
  // 静的ファイルの提供
  console.log('Serving static files from:', clientBuildPath);
  app.use(express.static(clientBuildPath));
  
  // すべてのルートをindexにリダイレクト
  app.get('*', (req, res) => {
    console.log('Sending index.html from:', indexHtmlPath);
    if (require('fs').existsSync(indexHtmlPath)) {
      res.sendFile(indexHtmlPath);
    } else {
      res.status(404).send('Build files not found. Make sure the client build has completed.');
    }
  });
}

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});