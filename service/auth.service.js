const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const prisma = require("../config/prismaClient");
const { sendVerificationCode } = require("../utils/mail.verification");
const { codeGenerator } = require("../utils/code.gen");
const client = require("../config/redis.js");

// ===================== ADMIN =====================
const registerAdmin = async (name, email, password) => {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const code = codeGenerator();
  await client.set(`verify:${email}`, code, { EX: 300 }); // 5 min
  await sendVerificationCode(email, code);

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
  if (!admin) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, admin.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken({ id: admin.id, role: "ADMIN" });
  const refreshToken = generateRefreshToken({ id: admin.id, role: "ADMIN" });

  return { admin, token, refreshToken };
};

// ===================== USER =====================
const registerUser = async (username, email, password) => {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Username already in use");

  const code = codeGenerator();
  await client.set(`verify:${email}`, code, { EX: 300 });
  await sendVerificationCode(email, code);

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, password: hashed },
  });

  const token = generateToken({ id: user.id, role: "USER" });
  const refreshToken = generateRefreshToken({ id: user.id, role: "USER" });

  return { user, token, refreshToken };
};

const loginUser = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken({ id: user.id, role: "USER" });
  const refreshToken = generateRefreshToken({ id: user.id, role: "USER" });

  return { user, token, refreshToken };
};

// ===================== EMAIL VERIFICATION =====================
const verifyEmail = async (email, code) => {
  const storedCode = await client.get(`verify:${email}`);
  if (!storedCode) throw new Error("Verification code expired");
  if (storedCode !== code) throw new Error("Invalid code");

  await client.del(`verify:${email}`);
  return { verified: true };
};

module.exports = {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
  verifyEmail,
};
