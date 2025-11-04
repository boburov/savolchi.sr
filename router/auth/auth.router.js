const express = require("express");
const router = express.Router();
const { 
  registerAdmin, loginAdmin, 
  registerUser, loginUser, verifyEmail 
} = require("../../service/auth.service");

// ADMIN
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const data = await registerAdmin(name, email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginAdmin(email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// USER
router.post("/user/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const data = await registerUser(username, email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await loginUser(username, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// EMAIL VERIFICATION
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const data = await verifyEmail(email, code);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
