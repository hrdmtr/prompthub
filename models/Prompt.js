// models/Prompt.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const PromptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['クリエイティブ', 'ビジネス', '教育', 'テクニカル', 'データ分析', 'その他']
  },
  purpose: {
    type: String,
    required: true,
    enum: ['文章生成', 'コード作成', 'データ分析', '画像生成', '要約', 'アイデア出し', '学習支援', 'その他']
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  usageCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// インデックスの作成（検索最適化）
PromptSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Prompt', PromptSchema);