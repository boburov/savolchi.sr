const prisma = require("../config/prismaClient");

// Barcha adminlar va ularning subscriptionlarini olish
const all_users = async () => {
  try {
    const users = await prisma.admin.findMany({
      include: {
        subscription: true, // adminning subscriptioni
        channel: {          // agar kanal mavjud bo‘lsa, uni ham qo‘shish
          include: {
            subjects: true,
          },
        },
      },
    });

    return {
      msg: "Adminlar va ularning subscriptionlari topildi",
      users,
    };
  } catch (error) {
    console.log(error);
    return {
      msg: "Xatolik yuz berdi",
      error,
    };
  }
};

// Foydalanuvchining profil rasmlarini upload qilish uchun bo‘sh funksiya
const upload_pfp = async () => {
  // bu yerga file upload logikasi qo‘yiladi
};

module.exports = {
  all_users,
  upload_pfp,
};
