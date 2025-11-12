const { Router } = require("express");
const { uploadMiddleware } = require("../middleware/upload");
const file_router = Router();

file_router.post("/upload/:type", (req, res) => {
  const type = req.params.type;
  const upload = uploadMiddleware(type);

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Fayl topilmadi" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    res.json({ success: true, url: fileUrl });
  });
});

module.exports = file_router;
