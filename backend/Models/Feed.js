const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const feedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  video: String,
  type: { type: String, enum: ['feed', 'reel'], default: 'feed' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  // Use Mixed type to support both ObjectId and string (for guest users)
  likes: [{ type: mongoose.Schema.Types.Mixed }],
  dislikes: [{ type: mongoose.Schema.Types.Mixed }],
  comments: [commentSchema],
  shares: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Feed', feedSchema);
