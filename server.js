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
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB接続
mongoose.connect('mongodb://localhost:27017/prompthub')
  .then(() => console.log('MongoDB connected to localhost:27017'))
  .catch(err => console.error('MongoDB connection error:', err));

// テスト用の基本APIエンドポイント
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// APIルートの設定
app.use('/api/prompts', promptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// 本番環境ではReactアプリを提供
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});