// routes/promptRoutes.js
const express = require('express');

const router = express.Router();
const Prompt = require('../models/Prompt');
const User = require('../models/User');
const auth = require('../middleware/auth');

// プロンプト一覧取得
router.get('/', async (req, res) => {
  try {
    const { category, purpose, search, sort = 'latest', limit = 0, showDeleted = 'false' } = req.query;
    const query = {};
    
    // 論理削除されたプロンプトの除外（管理者モードでない場合）
    if (showDeleted !== 'true') {
      query.isDeleted = { $ne: true };
    }
    
    // カテゴリフィルター
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // 用途フィルター
    if (purpose && purpose !== 'all') {
      query.purpose = purpose;
    }
    
    // 検索クエリ
    if (search) {
      query.$text = { $search: search };
    }
    
    // ソートオプション
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { usageCount: -1 };
        break;
      case 'trending':
        sortOption = { 'likes.length': -1 };
        break;
      case 'featured':
        query.isFeatured = true;
        sortOption = { createdAt: -1 };
        break;
      case 'latest':
      default:
        sortOption = { createdAt: -1 };
    }
    
    // クエリの作成
    let promptQuery = Prompt.find(query)
      .sort(sortOption)
      .populate('user', 'username avatar')
      .populate('comments.userId', 'username avatar');
    
    // 件数制限（limitが0より大きい場合のみ適用）
    if (parseInt(limit) > 0) {
      promptQuery = promptQuery.limit(parseInt(limit));
    }
    
    const prompts = await promptQuery;
      
    res.json(prompts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// プロンプト詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { showDeleted = 'false' } = req.query;
    const query = { _id: req.params.id };
    
    // 論理削除されたプロンプトの除外（管理者モードでない場合）
    if (showDeleted !== 'true') {
      query.isDeleted = { $ne: true };
    }
    
    const prompt = await Prompt.findOne(query)
      .populate('user', 'username avatar')
      .populate('comments.userId', 'username avatar');
      
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// プロンプト作成
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, purpose, service, model, tags } = req.body;
    
    const newPrompt = new Prompt({
      title,
      content,
      user: req.user.id,
      category,
      purpose,
      service: service || 'その他',
      model,
      tags: tags || []
    });
    
    const prompt = await newPrompt.save();
    
    // ユーザーのプロンプト配列に追加
    await User.findByIdAndUpdate(req.user.id, {
      $push: { prompts: prompt._id }
    });
    
    res.json(prompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// プロンプト更新
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, purpose, service, model, tags } = req.body;
    
    // プロンプト所有者チェック
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    if (prompt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }
    
    // 更新データ
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (purpose) updateData.purpose = purpose;
    if (service) updateData.service = service;
    if (model !== undefined) updateData.model = model;
    if (tags) updateData.tags = tags;
    
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json(updatedPrompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// プロンプト論理削除
router.delete('/:id', auth, async (req, res) => {
  try {
    // プロンプト所有者チェック
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    if (prompt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }
    
    // 論理削除を実行
    prompt.isDeleted = true;
    prompt.deletedAt = new Date();
    await prompt.save();
    
    // 注意: ユーザーのプロンプト配列からは削除しない
    // 復元可能性を維持するために関連付けをそのまま残す
    
    res.json({ 
      message: 'プロンプトを削除しました',
      deletedAt: prompt.deletedAt,
      isDeleted: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// プロンプト復元
router.put('/restore/:id', auth, async (req, res) => {
  try {
    // プロンプト所有者チェック
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    if (prompt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }
    
    // 削除状態を確認
    if (!prompt.isDeleted) {
      return res.status(400).json({ message: 'このプロンプトは削除されていません' });
    }
    
    // 復元を実行
    prompt.isDeleted = false;
    prompt.deletedAt = null;
    await prompt.save();
    
    res.json({ 
      message: 'プロンプトを復元しました',
      isDeleted: false 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// いいね追加/削除
router.put('/like/:id', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    // いいね状態確認
    const isLiked = prompt.likes.includes(req.user.id);
    
    if (isLiked) {
      // いいね削除
      prompt.likes = prompt.likes.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // いいね追加
      prompt.likes.push(req.user.id);
    }
    
    await prompt.save();
    
    res.json({ likes: prompt.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// コメント追加
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    const newComment = {
      userId: req.user.id,
      content
    };
    
    prompt.comments.push(newComment);
    await prompt.save();
    
    const updatedPrompt = await Prompt.findById(req.params.id)
      .populate('comments.userId', 'username avatar');
    
    res.json(updatedPrompt.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// コメント削除
router.delete('/comment/:promptId/:commentId', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    // コメント存在確認
    const comment = prompt.comments.find(
      c => c._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ message: 'コメントが見つかりません' });
    }
    
    // コメント作成者またはプロンプト作成者のみ削除可能
    if (comment.userId.toString() !== req.user.id && 
        prompt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: '権限がありません' });
    }
    
    // コメント削除
    prompt.comments = prompt.comments.filter(
      c => c._id.toString() !== req.params.commentId
    );
    
    await prompt.save();
    
    res.json(prompt.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 使用回数増加
router.put('/use/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    res.json({ usageCount: prompt.usageCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;