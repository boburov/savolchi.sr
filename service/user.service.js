const prisma = require("../config/prismaClient");

const all_users = async () => {
  try {
    const users = await prisma.user.findMany({});

    return {
      msg: "userlar topildi",
      users,
    };
  } catch (error) {
    console.log(error);
  }
};


module.exports={
    all_users
}