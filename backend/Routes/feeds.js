const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Feed = require('../models/Feed');
const User = require('../models/User');

// Create feeds upload directory
const feedsDir = path.join(__dirname, '..', 'uploads', 'feeds');
if (!fs.existsSync(feedsDir)) {
  fs.mkdirSync(feedsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, feedsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|ogg|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');
    
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image and video files are allowed'));
  }
});

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID tidak ditemukan' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang dapat mengakses' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('isAdmin error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all active feeds/reels (public)
router.get('/', async (req, res) => {
  try {
    const feeds = await Feed.find({ isActive: true })
      .populate('adminId', 'username profileImage')
      .populate('comments.userId', 'username profileImage')
      .sort({ createdAt: -1 });
    
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all feeds (admin - including inactive) - MUST be before /:id route
router.get('/admin/all', isAdmin, async (req, res) => {
  try {
    const feeds = await Feed.find()
      .populate('adminId', 'username profileImage')
      .populate('comments.userId', 'username profileImage')
      .sort({ createdAt: -1 });
    
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create feed/reel with JSON (admin only) - for URL-based images/videos
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, description, image, video, type, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Judul harus diisi' });
    }

    if (!image && !video) {
      return res.status(400).json({ message: 'Gambar atau video harus diisi' });
    }

    const feed = await Feed.create({
      title,
      description: description || '',
      image: image || '',
      video: video || '',
      type: type || 'feed',
      adminId: req.user._id,
      isActive: isActive !== false,
      likes: [],
      dislikes: [],
      comments: [],
      shares: 0
    });

    const populatedFeed = await feed.populate('adminId', 'username profileImage');
    res.status(201).json(populatedFeed);
  } catch (error) {
    console.error('Create feed error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get feed by ID with populated likes/dislikes
router.get('/:id', async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id)
      .populate('adminId', 'username profileImage')
      .populate('comments.userId', 'username profileImage');
    
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }

    // Manually populate likes and dislikes (handle both ObjectId and string for guests)
    const populatedLikes = [];
    for (const like of feed.likes) {
      if (mongoose.Types.ObjectId.isValid(like)) {
        try {
          const user = await User.findById(like).select('username profileImage');
          if (user) {
            populatedLikes.push(user);
          } else {
            // If user not found, keep the ID as string (guest)
            populatedLikes.push(like.toString());
          }
        } catch (err) {
          populatedLikes.push(like.toString());
        }
      } else {
        // It's a guest ID (string)
        populatedLikes.push(like);
      }
    }

    const populatedDislikes = [];
    for (const dislike of feed.dislikes) {
      if (mongoose.Types.ObjectId.isValid(dislike)) {
        try {
          const user = await User.findById(dislike).select('username profileImage');
          if (user) {
            populatedDislikes.push(user);
          } else {
            populatedDislikes.push(dislike.toString());
          }
        } catch (err) {
          populatedDislikes.push(dislike.toString());
        }
      } else {
        populatedDislikes.push(dislike);
      }
    }

    // Return feed with populated likes/dislikes
    const feedObj = feed.toObject();
    feedObj.likes = populatedLikes;
    feedObj.dislikes = populatedDislikes;
    
    res.json(feedObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create feed/reel with file upload (admin only)
router.post('/upload', isAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, type, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Judul harus diisi' });
    }

    let imageUrl = '';
    let videoUrl = '';

    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        imageUrl = `/feeds/${req.files['image'][0].filename}`;
      }
      if (req.files['video'] && req.files['video'][0]) {
        videoUrl = `/feeds/${req.files['video'][0].filename}`;
      }
    }

    if (!imageUrl && !videoUrl) {
      return res.status(400).json({ message: 'Gambar atau video harus diisi' });
    }

    const feed = await Feed.create({
      title,
      description: description || '',
      image: imageUrl,
      video: videoUrl,
      type: type || 'feed',
      adminId: req.user._id,
      isActive: isActive !== 'false',
      likes: [],
      dislikes: [],
      comments: [],
      shares: 0
    });

    const populatedFeed = await feed.populate('adminId', 'username profileImage');
    res.status(201).json(populatedFeed);
  } catch (error) {
    console.error('Create feed error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Like a feed
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID diperlukan' });
    }

    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }

    // Remove from dislikes if exists
    feed.dislikes = feed.dislikes.filter(id => id.toString() !== userId);

    // Toggle like
    const likeIndex = feed.likes.findIndex(id => id.toString() === userId);
    if (likeIndex > -1) {
      feed.likes.splice(likeIndex, 1);
    } else {
      feed.likes.push(userId);
    }

    await feed.save();
    res.json({ likes: feed.likes.length, dislikes: feed.dislikes.length, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dislike a feed
router.post('/:id/dislike', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID diperlukan' });
    }

    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }

    // Remove from likes if exists
    feed.likes = feed.likes.filter(id => id.toString() !== userId);

    // Toggle dislike
    const dislikeIndex = feed.dislikes.findIndex(id => id.toString() === userId);
    if (dislikeIndex > -1) {
      feed.dislikes.splice(dislikeIndex, 1);
    } else {
      feed.dislikes.push(userId);
    }

    await feed.save();
    res.json({ likes: feed.likes.length, dislikes: feed.dislikes.length, disliked: dislikeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Add comment to feed
router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ message: 'User ID dan komentar diperlukan' });
    }

    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }

    feed.comments.push({ userId, text });
    await feed.save();

    const updatedFeed = await Feed.findById(req.params.id)
      .populate('comments.userId', 'username profileImage');

    res.json(updatedFeed.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment
router.delete('/:id/comment/:commentId', async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }

    feed.comments = feed.comments.filter(c => c._id.toString() !== req.params.commentId);
    await feed.save();

    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share feed (increment share count)
router.post('/:id/share', async (req, res) => {
  try {
    const feed = await Feed.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }
    res.json({ shares: feed.shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update feed/reel (admin only)
router.patch('/:id', isAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, type, isActive } = req.body;

    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }

    let imageUrl = feed.image;
    let videoUrl = feed.video;

    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        imageUrl = `/feeds/${req.files['image'][0].filename}`;
      }
      if (req.files['video'] && req.files['video'][0]) {
        videoUrl = `/feeds/${req.files['video'][0].filename}`;
      }
    }

    const updatedFeed = await Feed.findByIdAndUpdate(
      req.params.id,
      {
        title: title || feed.title,
        description: description || feed.description,
        image: imageUrl,
        video: videoUrl,
        type: type || feed.type,
        isActive: isActive !== undefined ? isActive !== 'false' : feed.isActive
      },
      { new: true }
    ).populate('adminId', 'username profileImage');

    res.json(updatedFeed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete feed/reel (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'Feed tidak ditemukan' });
    }

    if (feed.image && feed.image.startsWith('/feeds/')) {
      const imagePath = path.join(feedsDir, path.basename(feed.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    if (feed.video && feed.video.startsWith('/feeds/')) {
      const videoPath = path.join(feedsDir, path.basename(feed.video));
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await Feed.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feed berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
