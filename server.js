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
console.log('Attempting to connect to MongoDB at:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@'));

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