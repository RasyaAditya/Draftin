require('dotenv').config();
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./Routes/auth');
const userRoutes = require('./Routes/users');
const productRoutes = require('./Routes/products');
const transactionRoutes = require('./Routes/transactions');

const app = express();
app.use(cors()); // allow all origins for production
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
