const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadMiddleware = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const folder = path.join(__dirname, `../uploads/${file.fieldname}`);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      cb(null, folder);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    },
  });

  const allowedTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
  ];

  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
    fileFilter: (req, file, cb) => {
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(
          new Error(
            "Faqat PNG, JPG, JPEG, WEBP yoki SVG fayllarini yuklashingiz mumkin."
          )
        );
      }
      cb(null, true);
    },
  }).fields([
    { name: "pfp", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]);
};

module.exports = { uploadMiddleware };
