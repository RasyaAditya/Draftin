require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const pass = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ username: 'admin', email: 'admin@example.com', password: pass, role: 'admin' });
  console.log('Admin created:', admin);
  process.exit(0);
})();
