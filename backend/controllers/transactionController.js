const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const User = require("../models/User");

// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const total = product.price * quantity;

    const trx = await Transaction.create({
      userId,
      productId,
      quantity,
      total,
      date: new Date(),
    });

    res.json({ message: "Transaction created", trx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    const trx = await Transaction.find().populate("userId productId");
    res.json(trx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
