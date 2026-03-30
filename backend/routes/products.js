const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// create product (admin only or seller)
router.post('/', auth, role('admin'), async (req, res) => {
  const data = req.body;
  data.createdBy = req.user._id;
  const p = await Product.create(data);
  res.json(p);
});

// get all products (public)
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// get single
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// update (admin)
router.put('/:id', auth, role('admin'), async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(p);
});

// delete (admin)
router.delete('/:id', auth, role('admin'), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;

