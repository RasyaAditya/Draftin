const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// get profile
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// get all users (admin)
router.get('/', auth, role('admin'), async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// update user (admin or owner)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id)
    return res.status(403).json({ message: 'Forbidden' });
  const up = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(up);
});

// delete (admin)
router.delete('/:id', auth, role('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
