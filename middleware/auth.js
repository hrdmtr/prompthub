// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // トークンの取得
  const token = req.header('x-auth-token');

  // トークンが存在しない場合
  if (!token) {
    return res.status(401).json({ message: '認証トークンがありません' });
  }

  try {
    // トークン検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // リクエストにユーザー情報を追加
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'トークンが無効です' });
  }
};