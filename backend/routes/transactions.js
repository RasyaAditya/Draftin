const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// create transaction (customer)
router.post('/', auth, role('customer'), async (req, res) => {
  const { items } = req.body; // items: [{ product: id, qty }]
  if (!items || !items.length) return res.status(400).json({ message: 'Items required' });

  // populate price and calculate total
  let total = 0;
  const lineItems = [];
  for (const it of items) {
    const prod = await Product.findById(it.product);
    if (!prod) return res.status(400).json({ message: 'Product not found' });
    if (prod.stock < it.qty) return res.status(400).json({ message: `Stock not enough for ${prod.title}` });
    lineItems.push({ product: prod._id, qty: it.qty, price: prod.price });
    total += prod.price * it.qty;
    // optional: reduce stock
    prod.stock -= it.qty;
    await prod.save();
  }

  const tx = await Transaction.create({ user: req.user._id, items: lineItems, total });
  res.json(tx);
});

// get my transactions
router.get('/me', auth, async (req, res) => {
  const tx = await Transaction.find({ user: req.user._id }).populate('items.product').sort({ createdAt: -1 });
  res.json(tx);
});

// admin: get all
router.get('/', auth, role('admin'), async (req, res) => {
  const tx = await Transaction.find().populate('user').populate('items.product').sort({ createdAt: -1 });
  res.json(tx);
});

// update status (admin)
router.put('/:id/status', auth, role('admin'), async (req, res) => {
  const { status } = req.body;
  const t = await Transaction.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(t);
});

module.exports = router;
