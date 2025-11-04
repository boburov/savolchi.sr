const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, registerUser, loginUser } = require("../../service/auth.service");

// ADMIN REGISTER
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const data = await registerAdmin(name, email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADMIN LOGIN
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginAdmin(email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// USER REGISTER
router.post("/user/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await registerUser(username, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// USER LOGIN
router.post("/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await loginUser(username, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; // 🔥 MUHIM!
