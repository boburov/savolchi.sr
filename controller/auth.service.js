const { hashPassword, comparePassword } = require("../utils/hash.js");
const { generateToken, generateRefreshToken } = require("../utils/jwt.js");
const prisma = require("../config/prismaClient.js");
const mailService = require("../utils/mail.verification.js");
const { codeGenerator } = require("../utils/code.gen.js");
const client = require("../config/redis.js");
const jwt = require("jsonwebtoken");

const registerAdmin = async (name, email, password) => {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: "Email already in use" };

  const code = codeGenerator();
  await client.set(`verify:${email}`, code, { EX: 300 });
  await mailService.sendVerificationCode(email, code);

  const hashed = await hashPassword(password);
  const admin = await prisma.admin.create({
    data: { name, email, password: hashed },
  });

  const token = generateToken({ id: admin.id, role: "ADMIN" });
  const refreshToken = generateRefreshToken({ id: admin.id, role: "ADMIN" });

  return { admin, token, refreshToken };
};

const loginAdmin = async (email, password) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw { status: 401, message: "Invalid credentials" };

  const valid = await comparePassword(password, admin.password);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  const token = generateToken({ id: admin.id, role: "ADMIN" });
  const refreshToken = generateRefreshToken({ id: admin.id, role: "ADMIN" });

  return { admin, token, refreshToken };
};

const registerUser = async (username, email, password) => {
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
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: "Invalid credentials" };

  const valid = await comparePassword(password, user.password);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  const token = generateToken({ id: user.id, role: "USER" });
  const refreshToken = generateRefreshToken({ id: user.id, role: "USER" });

  return { user, token, refreshToken };
};

const verifyEmail = async (email, code) => {
  const storedCode = await client.get(`verify:${email}`);
  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) throw { status: 404, message: "Email not found" };
  if (!storedCode) throw { status: 410, message: "Verification code expired" };
  if (storedCode !== code) throw { status: 400, message: "Invalid code" };

  const new_user = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });

  return { new_user };
};

const verify_token = async (token) => {
  if (!token) throw { status: 400, message: "Token berilmagan" };

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    let userOrAdmin;

    if (payload.role === "USER") {
      userOrAdmin = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!userOrAdmin) throw { status: 404, message: "User topilmadi" };
    } else if (payload.role === "ADMIN") {
      userOrAdmin = await prisma.admin.findUnique({ where: { id: payload.id } });
      if (!userOrAdmin) throw { status: 404, message: "Admin topilmadi" };
    } else {
      throw { status: 400, message: "Noto‘g‘ri role" };
    }

    return userOrAdmin;
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw { status: 401, message: "Token muddati tugagan" };
    throw { status: 401, message: "Noto'g'ri token" };
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  registerUser,
  verify_token,
  loginUser,
  verifyEmail,
};
