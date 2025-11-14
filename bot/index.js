// Foydalanuvchi obunasini hisoblash funksiyasi
function getExpiryDate(planType) {
  const now = new Date();
  switch (planType) {
    case "MONTHLY":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 kun
    case "THREE_MONTHS":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 kun
    case "SIX_MONTHS":
      return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 kun
    case "YEARLY":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 kun
    default:
      return now;
  }
}

// Formatlash funksiyasi: soat, minut, sekund bilan
function formatDateTime(date) {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

function bot_runner() {
  require("dotenv").config();
  const { Telegraf, Markup } = require("telegraf");
  const prisma = require("../config/prismaClient");
  const bcrypt = require("bcryptjs");
  const nodemailer = require("nodemailer");

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

  const bot = new Telegraf(BOT_TOKEN);
  const state = {};

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Menyular
  const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback("Ro'yxatdan o'tish", "register")],
    [Markup.button.callback("Kirish", "login")],
  ]);

  const subscriptionMenu = Markup.inlineKeyboard([
    [
      Markup.button.callback("1 oylik - $8.99", "plan_MONTHLY"),
      Markup.button.callback("3 oylik - $24.99", "plan_THREE"),
    ],
    [
      Markup.button.callback("6 oylik - $44.99", "plan_SIX"),
      Markup.button.callback("1 yillik - $78.99", "plan_YEARLY"),
    ],
    [Markup.button.callback("Bekor qilish", "cancel")],
  ]);

  const plans = [
    { type: "MONTHLY", name: "1 oylik", price: 8.99, limit: 300, branch: 4 },
    {
      type: "THREE_MONTHS",
      name: "3 oylik",
      price: 24.99,
      limit: 500,
      branch: 6,
    },
    {
      type: "SIX_MONTHS",
      name: "6 oylik",
      price: 44.99,
      limit: 1000,
      branch: 10,
    },
    { type: "YEARLY", name: "1 yillik", price: 78.99, limit: 2000, branch: 12 },
  ];

  // /start
  bot.start(async (ctx) => {
    const chatId = String(ctx.chat.id);
    const admin = await prisma.admin.findUnique({ where: { tgId: chatId } });

    if (admin) {
      // Obuna ma'lumotlarini tekshirish
      const subscription = await prisma.subscription.findUnique({
        where: { adminId: admin.tgId },
      });

      if (subscription && subscription.verifed) {
        const expireDate = subscription.expiresAt
          ? subscription.expiresAt.toLocaleDateString("uz-UZ")
          : "Noma'lum";
        return ctx.replyWithHTML(
          `👋 <b>Qaytdingiz!</b>\nSizning obunangiz: <b>${subscription.type}</b>\nCheklov: ${subscription.limit}\nBranch: ${subscription.subjectLimit}\nMuddat tugash sanasi: ${expireDate}\n\nObunani yangilash uchun tugmani bosing 👇`,
          Markup.inlineKeyboard([
            [Markup.button.callback("Obuna olish", "buy_subscription")],
          ])
        );
      }

      return ctx.replyWithHTML(
        "👋 <b>Qaytdingiz!</b>\nObuna olish uchun quyidagi tugmani bosing 👇",
        Markup.inlineKeyboard([
          [Markup.button.callback("Obuna olish", "buy_subscription")],
        ])
      );
    }

    state[chatId] = null;
    ctx.replyWithHTML(
      "👋 <b>Xush kelibsiz!</b>\nIltimos, davom etish uchun tanlang:",
      mainMenu
    );
  });

  // Ro'yxatdan o'tish
  bot.action("register", async (ctx) => {
    await ctx.answerCbQuery();
    state[String(ctx.chat.id)] = { step: "register_name" };
    ctx.reply("📝 Ismingizni kiriting:");
  });

  // Login
  bot.action("login", async (ctx) => {
    await ctx.answerCbQuery();
    state[String(ctx.chat.id)] = { step: "login_email" };
    ctx.reply("📧 Emailni kiriting:");
  });

  // Obuna olish
  bot.action("buy_subscription", async (ctx) => {
    await ctx.answerCbQuery();
    state[String(ctx.chat.id)] = { step: "select_plan" };
    ctx.reply("💳 Obuna tanlang:", subscriptionMenu);
  });

  ["MONTHLY", "THREE", "SIX", "YEARLY"].forEach((planKey) => {
    bot.action(`plan_${planKey}`, async (ctx) => {
      await ctx.answerCbQuery();
      state[String(ctx.chat.id)] = { step: "await_payment", plan: planKey };
      ctx.replyWithHTML(
        `💳 Siz tanladingiz: <b>${planKey}</b>\nIltimos, quyidagi kartaga to'lovni yuboring: <b>9860160602761381</b>\n\nCheckni yuboring 👇`
      );
    });
  });

  bot.action("cancel", async (ctx) => {
    await ctx.answerCbQuery();
    delete state[String(ctx.chat.id)];
    ctx.reply("❌ Jarayon bekor qilindi.");
  });

  // Text xabarlar
  bot.on("text", async (ctx) => {
    const chatId = String(ctx.chat.id);
    const st = state[chatId];
    if (!st) return;

    // Ro'yxatdan o'tish
    if (st.step === "register_name") {
      st.name = ctx.message.text;
      st.step = "register_email";
      return ctx.reply("📧 Emailni kiriting:");
    }

    if (st.step === "register_email") {
      st.email = ctx.message.text.trim();
      st.step = "register_password";
      return ctx.reply("🔑 Parol kiriting:");
    }

    if (st.step === "register_password") {
      const hashed = await bcrypt.hash(ctx.message.text, 10);
      try {
        await prisma.admin.create({
          data: {
            name: st.name,
            email: st.email,
            password: hashed,
            tgId: chatId,
          },
        });
        delete state[chatId];
        return ctx.reply("✅ Ro‘yxatdan o‘tdingiz! /start bosing", mainMenu);
      } catch {
        delete state[chatId];
        return ctx.reply("⚠️ Bu email allaqachon mavjud!");
      }
    }

    // Login flow
    if (st.step === "login_email") {
      st.email = ctx.message.text.trim();
      st.step = "login_password";
      return ctx.reply("🔑 Parol kiriting:");
    }

    if (st.step === "login_password") {
      const admin = await prisma.admin.findUnique({
        where: { email: st.email },
      });
      if (!admin) {
        delete state[chatId];
        return ctx.reply("❌ Email topilmadi.");
      }

      const ok = await bcrypt.compare(ctx.message.text, admin.password);
      if (!ok) {
        delete state[chatId];
        return ctx.reply("❌ Parol noto‘g‘ri.");
      }

      if (!admin.tgId) {
        await prisma.admin.update({
          where: { id: admin.id },
          data: { tgId: chatId },
        });
      }

      delete state[chatId];
      return ctx.replyWithHTML(
        "✅ Kirdingiz!\nObuna olish uchun quyidagi tugmani bosing 👇",
        Markup.inlineKeyboard([
          [Markup.button.callback("Obuna olish", "buy_subscription")],
        ])
      );
    }

    // Check yuborish
    if (st.step === "await_payment") {
      const plan = st.plan;
      const user = await prisma.admin.findUnique({ where: { tgId: chatId } });

      await bot.telegram.sendMessage(
        ADMIN_CHAT_ID,
        `<b>Yangi check!</b>\nID: ${chatId}\nPlan: ${plan}\nEmail: ${user?.email}\nCheck: ${ctx.message.text}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Tasdiqlash",
                  callback_data: `verify_${chatId}_${plan}`,
                },
              ],
              [{ text: "❌ Rad etish", callback_data: `reject_${chatId}` }],
            ],
          },
        }
      );

      if (user?.email) {
        transporter
          .sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Check qabul qilindi",
            text: `Salom ${user.name}, sizning to'lov check adminga yuborildi!`,
          })
          .catch(console.error);
      }

      delete state[chatId];
      ctx.reply("📤 Check yuborildi, adminga ketdi.");
    }
  });

  // Photo xabarlar
  bot.on("photo", async (ctx) => {
    const chatId = String(ctx.chat.id);
    const st = state[chatId];
    if (!st || st.step !== "await_payment") return;

    const plan = st.plan;
    const fileId = ctx.message.photo.at(-1).file_id;
    const user = await prisma.admin.findUnique({ where: { tgId: chatId } });

    await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
      caption: `<b>Yangi check!</b>\nID: ${chatId}\nPlan: ${plan}\nEmail: ${user?.email}`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Tasdiqlash",
              callback_data: `verify_${chatId}_${plan}`,
            },
          ],
          [{ text: "❌ Rad etish", callback_data: `reject_${chatId}` }],
        ],
      },
    });

    if (user?.email) {
      transporter
        .sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Check qabul qilindi",
          text: `Salom ${user.name}, sizning to'lov check adminga yuborildi!`,
        })
        .catch(console.error);
    }

    delete state[chatId];
    ctx.reply("📤 Check yuborildi, adminga ketdi.");
  });

  // Verify subscription (admin)
  bot.action(/verify_(.*)_(.*)/, async (ctx) => {
    await ctx.answerCbQuery();

    const tgId = ctx.match[1];
    const planKey = ctx.match[2];

    const planMap = {
      MONTHLY: "MONTHLY",
      THREE: "THREE_MONTHS",
      SIX: "SIX_MONTHS",
      YEARLY: "YEARLY",
    };

    const enumPlan = planMap[planKey];
    if (!enumPlan) return ctx.reply("❌ Noto‘g‘ri plan!");

    const admin = await prisma.admin.findUnique({ where: { tgId } });
    if (!admin) return ctx.reply("❌ Admin topilmadi!");

    const selectedPlan = plans.find((p) => p.type === enumPlan);
    if (!selectedPlan) return ctx.reply("❌ Plan topilmadi!");

    await prisma.subscription.upsert({
      where: { adminId: admin.tgId },
      update: {
        verifed: true,
        limit: selectedPlan.limit,
        subjectLimit: selectedPlan.branch,
        type: enumPlan,
        expiresAt: getExpiryDate(enumPlan),
      },
      create: {
        adminId: admin.tgId,
        type: enumPlan,
        verifed: true,
        limit: selectedPlan.limit,
        subjectLimit: selectedPlan.branch,
        expiresAt: getExpiryDate(enumPlan),
      },
    });

    if (admin.email) {
      transporter
        .sendMail({
          from: process.env.EMAIL_USER,
          to: admin.email,
          subject: "Obuna tasdiqlandi",
          text: `Salom ${admin.name}, sizning ${planKey} obunangiz tasdiqlandi!`,
        })
        .catch(console.error);
    }

    bot.telegram.sendMessage(tgId, "🎉 Obuna tasdiqlandi!");
    ctx.reply("✅ Tasdiqladim.");
  });

  // Reject subscription (admin)
  bot.action(/reject_(.*)/, async (ctx) => {
    await ctx.answerCbQuery();

    const tgId = ctx.match[1];

    const admin = await prisma.admin.findUnique({ where: { tgId } });
    if (!admin) return ctx.reply("❌ Admin topilmadi!");

    bot.telegram.sendMessage(
      tgId,
      `❌ Salom ${admin.name}, sizning yuborgan checkingiz rad etildi.\n@rovixwb bilan gaplashib ko'ring, u sizning checkingizni soxta deb hisobladi.`
    );

    ctx.reply("❌ Rad etdim va foydalanuvchiga xabar yuborildi.");
  });

  bot.launch();
  console.log("🚀 Bot ishga tushdi!");
}

module.exports = { bot_runner };
