// controller/auth.service.js
const { hashPassword, comparePassword } = require("../utils/hash.js");
const { generateToken, generateRefreshToken } = require("../utils/jwt.js");
const prisma = require("../config/prismaClient.js");
const mailService = require("../utils/mail.verification.js");
const { codeGenerator } = require("../utils/code.gen.js");
const client = require("../config/redis.js");
const jwt = require("jsonwebtoken");

const registerAdmin = async (name, email, password) => {
  try {
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) throw { status: 409, message: "Email already in use" };

    const code = codeGenerator();
    // Redis set bilan o'rab olinadi
    try {
      await client.set(`verify:${email}`, code, { EX: 300 });
    } catch (redisErr) {
      console.error("Redis set error:", redisErr);
      // Redis ishlamasa ham davom ettirishni xohlaysanmi? Hozir throw qilamiz.
      throw { status: 500, message: "Verification storage error" };
    }

    // Mail yuborish — agar mail server yo'q bo'lsa, mail util reject qiladi
    try {
      await mailService.sendVerificationCode(email, code);
    } catch (mailErr) {
      console.error("Mail send error:", mailErr);
      // Devda mail yuborishni majbur qilmaslik uchun foydalanuvchini yaratishdan oldin alert berish mumkin.
      // Ammo hozir xavfsizligi uchun rollback yoki xabar qaytarish mumkin.
      throw { status: 500, message: "Failed to send verification email" };
    }

    const hashed = await hashPassword(password);
    const admin = await prisma.admin.create({
      data: { name, email, password: hashed },
    });

    const token = generateToken({ id: admin.id, role: "ADMIN" });
    const refreshToken = generateRefreshToken({ id: admin.id, role: "ADMIN" });

    return { admin, token, refreshToken };
  } catch (err) {
    console.error("registerAdmin error:", err);
    throw err;
  }
};

const loginAdmin = async (email, password) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw { status: 401, message: "Invalid credentials" };

    const valid = await comparePassword(password, admin.password);
    if (!valid) throw { status: 401, message: "Invalid credentials" };

    const token = generateToken({ id: admin.id, role: "ADMIN" });
    const refreshToken = generateRefreshToken({ id: admin.id, role: "ADMIN" });

    return { admin, token, refreshToken };
  } catch (err) {
    console.error("loginAdmin error:", err);
    throw err;
  }
};

const verifyAdminEmail = async (email, code) => {
  try {
    const storedCode = await client.get(`verify:${email}`);
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) throw { status: 404, message: "Admin topilmadi" };
    if (!storedCode)
      throw { status: 410, message: "Verification code expired" };
    if (storedCode !== code) throw { status: 400, message: "Noto‘g‘ri code" };

    const verifiedAdmin = await prisma.admin.update({
      where: { email },
      data: { is_verifyed: true },
    });

    // optional: delete redis key
    try {
      await client.del(`verify:${email}`);
    } catch (e) {
      console.warn("Failed to delete redis key:", e);
    }

    return { verifiedAdmin };
  } catch (err) {
    console.error("verifyAdminEmail error:", err);
    throw err;
  }
};

const registerUser = async (username, email, password) => {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 409, message: "Email already in use" };

    const code = codeGenerator();
    await client.set(`verify:${email}`, code, { EX: 900 });
    await mailService.sendVerificationCode(email, code);

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, password: hashed },
    });

    const token = generateToken({ id: user.id, role: "USER" });
    const refreshToken = generateRefreshToken({ id: user.id, role: "USER" });

    return { user, token, refreshToken };
  } catch (err) {
    console.error("registerUser error:", err);
    throw err;
  }
};

const loginUser = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 401, message: "Invalid credentials" };

    const valid = await comparePassword(password, user.password);
    if (!valid) throw { status: 401, message: "Invalid credentials" };

    const token = generateToken({ id: user.id, role: "USER" });
    const refreshToken = generateRefreshToken({ id: user.id, role: "USER" });

    return { user, token, refreshToken };
  } catch (err) {
    console.error("loginUser error:", err);
    throw err;
  }
};

const verifyEmail = async (email, code) => {
  try {
    const storedCode = await client.get(`verify:${email}`);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw { status: 404, message: "Email not found" };
    if (!storedCode)
      throw { status: 410, message: "Verification code expired" };
    if (storedCode !== code) throw { status: 400, message: "Invalid code" };

    const new_user = await prisma.user.update({
      where: { email },
      data: { is_verified: true },
    });

    try {
      await client.del(`verify:${email}`);
    } catch (e) {
      console.warn("Failed to delete redis key:", e);
    }

    return { new_user };
  } catch (err) {
    console.error("verifyEmail error:", err);
    throw err;
  }
};

const verify_token = async (token) => {
  if (!token) throw { status: 400, message: "Token berilmagan" };

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    let userOrAdmin;

    if (payload.role === "USER") {
      userOrAdmin = await prisma.user.findUnique({
        where: { id: payload.id },
        include: {
          results: {
            include: {
              test: {
                include: {
                  subject: {
                    include: {
                      channel: {
                        include: { admin: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!userOrAdmin) throw { status: 404, message: "User topilmadi" };
    } else if (payload.role === "ADMIN") {
      userOrAdmin = await prisma.admin.findUnique({
        where: { id: payload.id },
        include: {
          channel: {
            include: {
              subjects: {
                include: {
                  tests: {
                    include: { questions: true, results: true },
                  },
                },
              },
            },
          },
          subscription: true,
        },
      });

      if (!userOrAdmin) throw { status: 404, message: "Admin topilmadi" };
    } else {
      throw { status: 400, message: "Noto‘g‘ri role" };
    }

    return { role: payload.role, ...userOrAdmin };
  } catch (err) {
    console.error("verify_token error:", err);
    if (err && err.name === "TokenExpiredError")
      throw { status: 401, message: "Token muddati tugagan" };
    throw { status: 401, message: "Noto‘g‘ri token" };
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  registerUser,
  verify_token,
  loginUser,
  verifyEmail,
  verifyAdminEmail, // <= muhim: eksport qilindi
};
