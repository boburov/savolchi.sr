const prisma = require("../config/prismaClient");

// CREATE SUBJECT (limit bilan)
const create_subject = async (name, channelId) => {
  const channel = await prisma.channel.findUnique({
    where: { id: parseInt(channelId) },
    include: {
      admin: {
        include: {
          subscription: true,
        },
      },
      subjects: true,
    },
  });

  if (!channel) {
    throw new Error("Channel topilmadi");
  }

  const subscription = channel.admin.subscription;
  if (!subscription) {
    throw new Error("Adminning obunasi yo'q");
  }

  const currentSubjectCount = channel.subjects.length;

  if (currentSubjectCount >= subscription.subjectLimit) {
    throw new Error("Subject limiti tugagan. Yangi subject qo‘shib bo‘lmaydi.");
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      channelId: parseInt(channelId),
    },
  });

  return subject;
};

// UPDATE SUBJECT
const update_subject = async (id, newName) => {
  const subject = await prisma.subject.findUnique({
    where: { id: parseInt(id) },
  });

  if (!subject) {
    throw new Error("Subject topilmadi");
  }

  const updated = await prisma.subject.update({
    where: { id: parseInt(id) },
    data: { name: newName },
  });

  return updated;
};

// DELETE SUBJECT
const delete_subject = async (id) => {
  const subject = await prisma.subject.findUnique({
    where: { id: parseInt(id) },
  });

  if (!subject) {
    throw new Error("Subject topilmadi");
  }

  const deleted = await prisma.subject.delete({
    where: { id: parseInt(id) },
  });

  return deleted;
};

module.exports = {
  create_subject,
  update_subject,
  delete_subject,
};
