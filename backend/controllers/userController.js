const User = require("../models/User");
const bcrypt = require("bcryptjs");

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      phone,
      password: hashed,
      role: role || "customer"
    });

    res.json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    res.json({ message: "Login success", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL USERS (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const data = await User.find().select("-password");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
