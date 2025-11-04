const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");
const prisma = require("../config/prismaClient");
const mailService = require("../utils/mail.verification");

const registerAdmin = async (name, email, password) => {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  mailService.sendVerificationCode(email, );

  const hashed = await hashPassword(password);
  const admin = await prisma.admin.create({
    data: { name, email, password: hashed },
  });

  const token = generateToken({ id: admin.id, role: "ADMIN" });
  return { admin, token };
};

const loginAdmin = async (email, password) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, admin.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken({ id: admin.id, role: "ADMIN" });
  return { admin, token };
};

const registerUser = async (username, password) => {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Username already in use");

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, password: hashed },
  });

  const token = generateToken({ id: user.id, role: "USER" });
  return { user, token };
};

const loginUser = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken({ id: user.id, role: "USER" });
  return { user, token };
};

module.exports = {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
};
