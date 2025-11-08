const express = require("express");
const multer = require("multer");
const route = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.png`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

route.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "Iltimos, 5MB dan kichik rasm yuklang.",
        });
      }
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Fayl tanlanmagan." });
    }

    res.json({ filePath: `/uploads/${req.file.filename}` });
  });
});

module.exports = route;
