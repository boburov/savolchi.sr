const prisma = require("../config/prismaClient.js");
const { uploadMiddleware } = require("../middleware/upload.js");
const fs = require("fs");

const create_chanel = async (req, res) => {
  try {
    const upload = uploadMiddleware();

    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err.message });

      const { name, bio, adminId } = req.body;
      if (!name) return res.status(400).json({ message: "Kanal nomi kerak" });
      if (!adminId)
        return res.status(400).json({ message: "Admin ID kiritilmagan" });

      const exist = await prisma.channel.findUnique({
        where: { adminId: Number(adminId) },
      });

      if (exist) {
        if (req.files) {
          Object.keys(req.files).forEach((field) => {
            req.files[field].forEach((file) => fs.unlinkSync(file.path));
          });
        }
        return res
          .status(400)
          .json({ message: "Siz allaqachon kanal yaratgansiz" });
      }

      if (!req.files || (!req.files.pfp && !req.files.banner)) {
        return res.status(400).json({ message: "Rasm fayllar kerak" });
      }

      // ✅ Fayl URL’larini to‘liq shaklda yaratish
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const pfpPath = req.files.pfp
        ? `${baseUrl}/uploads/pfp/${req.files.pfp[0].filename}`
        : null;

      const bannerPath = req.files.banner
        ? `${baseUrl}/uploads/banner/${req.files.banner[0].filename}`
        : null;

      const channel = await prisma.channel.create({
        data: {
          name,
          bio,
          adminId: Number(adminId),
          pfp: pfpPath,
          banner: bannerPath,
        },
      });

      return res.status(201).json({
        message: "Kanal muvaffaqiyatli yaratildi ✅",
        channel,
      });
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server xatosi", error: error.message });
  }
};

const all_chanels = async (req, res) => {
  try {
    const all_chanels = await prisma.channel.findMany({});

    res.json(all_chanels);
  } catch (error) {
    res.send(error);
  }
};

module.exports = { create_chanel, all_chanels };
