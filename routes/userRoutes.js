// routes/userRoutes.js
const express = require('express');

const router = express.Router();
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const auth = require('../middleware/auth');

// ユーザープロフィール取得
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .select('-email');
      
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ユーザープロフィール更新
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    
    // ユーザー名の重複チェック
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'このユーザー名は既に使用されています' });
      }
    }
    
    const user = await User.findById(req.user.id);
    
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ユーザーフォロー/アンフォロー
router.put('/follow/:id', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: '自分自身をフォローすることはできません' });
    }
    
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // フォロー状態チェック
    const isFollowing = currentUser.following.includes(req.params.id);
    
    if (isFollowing) {
      // アンフォロー処理
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // フォロー処理
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);
    }
    
    await currentUser.save();
    await userToFollow.save();
    
    res.json({ 
      following: currentUser.following,
      followers: userToFollow.followers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// プロンプト保存/保存解除
router.put('/save/:promptId', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ message: 'プロンプトが見つかりません' });
    }
    
    const user = await User.findById(req.user.id);
    
    // 保存状態チェック
    const isSaved = user.savedPrompts.includes(req.params.promptId);
    
    if (isSaved) {
      // 保存解除
      user.savedPrompts = user.savedPrompts.filter(
        id => id.toString() !== req.params.promptId
      );
    } else {
      // 保存
      user.savedPrompts.push(req.params.promptId);
    }
    
    await user.save();
    
    res.json({ savedPrompts: user.savedPrompts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 保存したプロンプト一覧取得
router.get('/saved/prompts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const savedPrompts = await Prompt.find({
      _id: { $in: user.savedPrompts }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate('comments.userId', 'username avatar');
      
    res.json(savedPrompts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// フォロー中のユーザーのプロンプト取得
router.get('/following/prompts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const followingPrompts = await Prompt.find({
      user: { $in: user.following }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate('comments.userId', 'username avatar');
      
    res.json(followingPrompts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;