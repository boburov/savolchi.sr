const prisma = require("../config/prismaClient");
const dayjs = require("dayjs");

const setSubscription = async (id, subscription_type) => {
  try {
    let limit;
    let expiresAt;
    let subject;
    switch (subscription_type) {
      case "MONTHLY":
        limit = 200;
        subject = 5;
        expiresAt = dayjs().add(30, "day").toDate();
        break;
      case "THREE_MONTHS":
        limit = 500;
        subject = 8;
        expiresAt = dayjs().add(90, "day").toDate();
        break;
      case "SIX_MONTHS":
        limit = 1000;
        subject = 10;
        expiresAt = dayjs().add(180, "day").toDate();
        break;
      case "YEARLY":
        limit = 2000;
        subject = 12;
        expiresAt = dayjs().add(365, "day").toDate();
        break;
      default:
        throw new Error("Noto‘g‘ri obuna turi kiritilgan!");
    }

    const subscription = await prisma.subscription.update({
      where: { adminId: id },
      data: {
        type: subscription_type,
        limit,
        expiresAt,
        subjectLimit: subject,
      },
    });

    return subscription;
  } catch (error) {
    throw new Error("Obunani yangilashda xatolik: " + error.message);
  }
};

module.exports = { setSubscription };
