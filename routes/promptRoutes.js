// routes/promptRoutes.js
const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ����� �֗
router.get('/', async (req, res) => {
  try {
    const { category, purpose, search, sort = 'latest' } = req.query;
    const query = {};
    
    // �ƴ�գ�
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // (գ�
    if (purpose && purpose !== 'all') {
      query.purpose = purpose;
    }
    
    // "գ�
    if (search) {
      query.$text = { $search: search };
    }
    
    // ���a�
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
    
    const prompts = await Prompt.find(query)
      .sort(sortOption)
      .populate('user', 'username avatar')
      .populate('comments.userId', 'username avatar');
      
    res.json(prompts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// �����s0֗
router.get('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('comments.userId', 'username avatar');
      
    if (!prompt) {
      return res.status(404).json({ message: '�����L�dK�~[�' });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// �����\
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, purpose, tags } = req.body;
    
    const newPrompt = new Prompt({
      title,
      content,
      user: req.user.id,
      category,
      purpose,
      tags: tags || []
    });
    
    const prompt = await newPrompt.save();
    
    // ����n����� �k��
    await User.findByIdAndUpdate(req.user.id, {
      $push: { prompts: prompt._id }
    });
    
    res.json(prompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// �������
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, purpose, tags } = req.body;
    
    // �����@	��ï
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: '�����L�dK�~[�' });
    }
    
    if (prompt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: ')PLB�~[�' });
    }
    
    // �����
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (purpose) updateData.purpose = purpose;
    if (tags) updateData.tags = tags;
    
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json(updatedPrompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// �����Jd
router.delete('/:id', auth, async (req, res) => {
  try {
    // �����@	��ï
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: '�����L�dK�~[�' });
    }
    
    if (prompt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: ')PLB�~[�' });
    }
    
    await Prompt.findByIdAndDelete(req.params.id);
    
    // ����n����� �K��Jd
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { prompts: req.params.id }
    });
    
    // �XW_����n��K��Jd
    await User.updateMany(
      { savedPrompts: req.params.id },
      { $pull: { savedPrompts: req.params.id } }
    );
    
    res.json({ message: '����ȒJdW~W_' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// DDm��/Jd
router.put('/like/:id', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: '�����L�dK�~[�' });
    }
    
    // DDmn�K��ï
    const isLiked = prompt.likes.includes(req.user.id);
    
    if (isLiked) {
      // DDmJd
      prompt.likes = prompt.likes.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // DDm��
      prompt.likes.push(req.user.id);
    }
    
    await prompt.save();
    
    res.json({ likes: prompt.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// ������
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: '�����L�dK�~[�' });
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
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// ����Jd
router.delete('/comment/:promptId/:commentId', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.promptId);
    if (!prompt) {
      return res.status(404).json({ message: '�����L�dK�~[�' });
    }
    
    // ����X(��ï
    const comment = prompt.comments.find(
      c => c._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ message: '����L�dK�~[�' });
    }
    
    // ����@	~_o�����@	nJd��
    if (comment.userId.toString() !== req.user.id && 
        prompt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: ')PLB�~[�' });
    }
    
    // ����Jd
    prompt.comments = prompt.comments.filter(
      c => c._id.toString() !== req.params.commentId
    );
    
    await prompt.save();
    
    res.json(prompt.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

// (���Ȥ�����
router.put('/use/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    if (!prompt) {
      return res.status(404).json({ message: '�����L�dK�~[�' });
    }
    
    res.json({ usageCount: prompt.usageCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '�������LzW~W_' });
  }
});

module.exports = router;