const prisma = require("../config/prismaClient");

// Test yaratish
const createTest = async (subjectId, question, options = []) => {
  // Subject mavjudligini tekshirish
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw new Error("Subject topilmadi");

  // Test yaratish
  const test = await prisma.test.create({
    data: {
      question,
      subjectId,
      options: {
        create: options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect || false,
        })),
      },
    },
    include: { options: true },
  });

  return test;
};

// Testni yangilash
const updateTest = async (testId, data) => {
  const test = await prisma.test.findUnique({ where: { id: testId }, include: { options: true } });
  if (!test) throw new Error("Test topilmadi");

  // Agar options yangilanayotgan bo‘lsa, avval o‘chirish va qayta yaratish
  if (data.options) {
    await prisma.option.deleteMany({ where: { testId } });
  }

  const updatedTest = await prisma.test.update({
    where: { id: testId },
    data: {
      question: data.question,
      options: data.options
        ? { create: data.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect || false })) }
        : undefined,
    },
    include: { options: true },
  });

  return updatedTest;
};

// Testni o‘chirish
const deleteTest = async (testId) => {
  // Avval optionlarni o‘chirib keyin testni o‘chirish
  await prisma.option.deleteMany({ where: { testId } });
  const deletedTest = await prisma.test.delete({ where: { id: testId } });
  return deletedTest;
};

// Bitta testni olish
const getTestById = async (testId) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { options: true, results: true },
  });
  if (!test) throw new Error("Test topilmadi");
  return test;
};

// Subjectdagi barcha testlar
const getTestsBySubject = async (subjectId) => {
  return await prisma.test.findMany({
    where: { subjectId },
    include: { options: true },
  });
};

module.exports = {
  createTest,
  updateTest,
  deleteTest,
  getTestById,
  getTestsBySubject,
};
