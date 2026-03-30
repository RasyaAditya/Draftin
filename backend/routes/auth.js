const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../');

// register
router.post('/register', async (req, res) => {
  const { username, email, number, password, role } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'username, email, password required' });

  const exist = await User.findOne({ $or: [{ email }, { username }] });
  if (exist) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, number, password: hashed, role });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token });
});

// login
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) return res.status(400).json({ message: 'required' });

  const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token });
});

module.exports = router;
