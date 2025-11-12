const prisma = require("../config/prismaClient");
const client = require("../config/redis");

const all_users = async () => {
  try {
    const users = await prisma.admin.findMany({});

    return {
      msg: "userlar topildi",
      users,
    };
  } catch (error) {
    console.log(error);
  }
};

const upload_pfp = async () => {
  
};

module.exports = {
  all_users,
};
