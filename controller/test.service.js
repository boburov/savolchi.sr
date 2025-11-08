
const prisma = require("../config/prismaClient");

const all_public_tests = async () => {
  const tests = await prisma.test.findMany({
    where: {
      type: "PUBLIC",
    },
  });
  return tests;
};

const test_by_id = async (id) => {
  const test = await prisma.test.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
  return test;
};


const create_test = async (name, description) => {
  const test = await prisma.test.create({
    data: {
      name,
      description,
      schoolId: 1, // Hardcoded schoolId for now
    },
  });
  return test;
};


const add_question_to_test = async (testId, question, options, correctOption) => {
  const newQuestion = await prisma.question.create({
    data: {
      question,
      testId: parseInt(testId),
      options: {
        create: options.map((opt) => ({ text: opt })),
      },
    },
    include: {
      options: true,
    },
  });

  const correctOptionId = newQuestion.options[correctOption].id;

  const updatedQuestion = await prisma.question.update({
    where: {
      id: newQuestion.id,
    },
    data: {
      correctId: correctOptionId,
    },
  });

  return updatedQuestion;
};

module.exports = {
  all_public_tests,
  test_by_id,
  create_test,
  add_question_to_test,
};
