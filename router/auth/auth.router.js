const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
  verifyEmail,
  verify_token,
  verifyAdminEmail,
} = require("../../controller/auth.service");

// ADMIN
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const data = await registerAdmin(name, email, password);
    res.json(data);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginAdmin(email, password);
    res.json(data);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
});

// USER
router.post("/user/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const data = await registerUser(username, email, password);
    res.json(data);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json(data);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const data = await verifyEmail(email, code);
    res.json(data);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
});

// ADMIN email verify
router.post("/admin/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const data = await verifyAdminEmail(email, code);
    res.json(data);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
});

router.post("/verify_token", async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verify_token(token);
    res.json(payload);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Server error" });
  }
});

module.exports = router;
