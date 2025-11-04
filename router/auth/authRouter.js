const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
} = require("../../service/auth.service");

const router = express.Router();

// 🧑‍💼 Admin register
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const data = await registerAdmin(name, email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔑 Admin login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginAdmin(email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👤 User register
router.post("/user/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await registerUser(username, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 👤 User login
router.post("/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await loginUser(username, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
