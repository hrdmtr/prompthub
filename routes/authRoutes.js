// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ユーザー名とメールアドレスの重複チェック
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ 
        message: 'このユーザー名またはメールアドレスは既に使用されています' 
      });
    }

    // 新規ユーザー作成
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // JWTトークン生成
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワード検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // JWTトークン生成
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 現在のユーザー情報取得
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;
