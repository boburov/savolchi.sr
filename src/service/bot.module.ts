import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Telegraf, Context, Markup } from 'telegraf';

dotenv.config();

type SessionStep =
  | 'IDLE'
  | 'CHOOSE_AUTH'
  | 'LOGIN_EMAIL'
  | 'LOGIN_PASSWORD'
  | 'REGISTER_NAME'
  | 'REGISTER_EMAIL'
  | 'REGISTER_PASSWORD'
  | 'AWAITING_PAYMENT';

interface Session {
  step?: SessionStep;
  temp?: any;
  awaitingPaymentProof?: boolean;
  selectedPlan?: any;
  tgUserId?: string;
}

@Module({
  providers: [],
  exports: [],
})
export class BotModule implements OnModuleInit {
  private prisma = new PrismaClient();
  private bot: Telegraf;
  constructor() {
    dotenv.config();
    this.bot = new Telegraf(process.env.BOT_TOKEN!);
  }
  private readonly logger = new Logger(BotModule.name);

  async onModuleInit() {
    const prisma = new PrismaClient();

    const bot = new Telegraf(process.env.BOT_TOKEN!);
    const SUPER_ADMIN_ID = Number(process.env.SUPER_ADMIN_ID || '6846125638');
    const CARD_NUMBER = process.env.CARD_NUMBER || '0000 0000 0000 0000';

    const sessions = new Map<number, Session>();

    const plans = [
      {
        id: '1',
        name: '1 oylik',
        price: 99_000,
        duration: 1,
        limit: 300,
        subjects: 4,
        type: 'MONTHLY',
      },
      {
        id: '2',
        name: '3 oylik',
        price: 249_000,
        duration: 3,
        limit: 500,
        subjects: 6,
        type: 'THREE_MONTHS',
      },
      {
        id: '3',
        name: '6 oylik',
        price: 449_000,
        duration: 6,
        limit: 1000,
        subjects: 10,
        type: 'SIX_MONTHS',
        popular: true,
      },
      {
        id: '4',
        name: '1 yillik',
        price: 789_000,
        duration: 12,
        limit: 2000,
        subjects: 12,
        type: 'YEARLY',
        best: true,
      },
    ];

    function getSession(userId: number) {
      if (!sessions.has(userId))
        sessions.set(userId, {
          step: 'IDLE',
          temp: {},
          tgUserId: String(userId),
        });
      return sessions.get(userId)!;
    }

    function sendPlans(ctx: Context) {
      const keyboard = Markup.inlineKeyboard(
        plans.map((p) => [
          Markup.button.callback(
            `${p.popular ? '🔥 ' : p.best ? '💎 ' : ''}${p.name} — ${p.price.toLocaleString()} so'm`,
            `plan_${p.id}`,
          ),
        ]),
      );
      return ctx.reply(`💳 Obuna turini tanlang:`, keyboard);
    }

    bot.start(async (ctx) => {
      const userId = ctx.from!.id;
      const session = getSession(userId);

      const admin = await prisma.admin.findUnique({
        where: { tgId: String(userId) },
      });

      if (admin) {
        session.step = 'IDLE';
        session.tgUserId = admin.id;
        await ctx.reply(
          `👋 Assalomu alaykum, ${admin.name}!\nSiz tizimga ulandingiz.`,
        );
        return sendPlans(ctx);
      }

      session.step = 'CHOOSE_AUTH';
      await ctx.reply(
        `👋 Assalomu alaykum!\nSiz tizimga kirilmagansiz. Iltimos login qiling yoki ro'yxatdan o'ting.`,
        Markup.inlineKeyboard([
          Markup.button.callback('🔑 Login', 'auth_login'),
          Markup.button.callback('🆕 Register', 'auth_register'),
        ]),
      );
    });

    bot.action('auth_login', async (ctx) => {
      const userId = ctx.from!.id;
      const session = getSession(userId);
      session.step = 'LOGIN_EMAIL';
      await ctx.answerCbQuery();
      await ctx.reply('📧 Iltimos email manzilingizni kiriting:');
    });

    bot.action('auth_register', async (ctx) => {
      const userId = ctx.from!.id;
      const session = getSession(userId);
      session.step = 'REGISTER_NAME';
      await ctx.answerCbQuery();
      await ctx.reply("📝 Ro'yxatdan o'tish — avvalo ismingizni kiriting:");
    });

    bot.on('text', async (ctx) => {
      const userId = ctx.from!.id;
      const text = ctx.message!.text!.trim();
      const session = getSession(userId);

      const linkedAdmin = await prisma.admin.findUnique({
        where: { tgId: String(userId) },
      });
      if (linkedAdmin && session.step === 'IDLE') {
        if (
          text.toLowerCase() === 'plans' ||
          text.toLowerCase() === 'obuna' ||
          text.toLowerCase() === '/plans'
        ) {
          return sendPlans(ctx);
        }
        return ctx.reply(
          'Botdan foydalanish uchun obunani tanlang: /start bilan qayta boshlang yoki "plans" yozing.',
        );
      }

      switch (session.step) {
        case 'LOGIN_EMAIL':
          session.temp = { email: text };
          session.step = 'LOGIN_PASSWORD';
          await ctx.reply('🔐 Endi parolni kiriting:');
          break;

        case 'LOGIN_PASSWORD': {
          const email = session.temp?.email;
          const password = text;
          if (!email) {
            session.step = 'LOGIN_EMAIL';
            return ctx.reply('Email topilmadi. Iltimos qayta kiriting:');
          }

          const admin = await prisma.admin.findUnique({ where: { email } });
          if (!admin) {
            session.step = 'CHOOSE_AUTH';
            return ctx.reply(
              "⚠️ Bu email ro'yxatda yo'q. Ro'yxatdan o'tish uchun /start kirib Register bosing yoki qayta urinib ko'ring.",
            );
          }

          const ok = await bcrypt.compare(password, admin.password);
          if (!ok) {
            session.step = 'CHOOSE_AUTH';
            return ctx.reply(
              '❌ Email yoki parol noto‘g‘ri. Boshlash uchun /start ni bosing.',
            );
          }

          await prisma.admin.update({
            where: { id: admin.id },
            data: { tgId: String(userId) },
          });

          session.step = 'IDLE';
          session.tgUserId = admin.id;
          session.temp = {};
          await ctx.reply(
            `✅ Muvaffaqiyatli login qilindingiz, ${admin.name}!`,
          );
          return sendPlans(ctx);
        }

        case 'REGISTER_NAME':
          session.temp = { name: text };
          session.step = 'REGISTER_EMAIL';
          await ctx.reply('📧 Endi email kiriting:');
          break;

        case 'REGISTER_EMAIL':
          if (!text.includes('@'))
            return ctx.reply('Iltimos haqiqiy email kiriting:');
          session.temp.email = text;
          session.step = 'REGISTER_PASSWORD';
          await ctx.reply('🔑 Parol (kamida 6 ta belgidan) kiriting:');
          break;

        case 'REGISTER_PASSWORD': {
          const { name, email } = session.temp || {};
          const password = text;
          if (!name || !email) {
            session.step = 'CHOOSE_AUTH';
            return ctx.reply(
              "Ro'yxatga olish ma'lumotlari yo'q. /start orqali qayta boshlang.",
            );
          }
          if (password.length < 6)
            return ctx.reply(
              "Parol juda qisqa — kamida 6 belgidan iborat bo'lsin.",
            );

          const existing = await prisma.admin.findUnique({ where: { email } });
          if (existing) {
            session.step = 'CHOOSE_AUTH';
            return ctx.reply(
              'Bu email bilan admin allaqachon mavjud. /start orqali login qiling.',
            );
          }

          const hashed = await bcrypt.hash(password, 10);
          const created = await prisma.admin.create({
            data: {
              name,
              email,
              password: hashed,
              tgId: String(userId),
              isVerified: true,
            },
          });

          session.step = 'IDLE';
          session.tgUserId = created.id;
          session.temp = {};
          await ctx.reply(
            `🎉 Ro'yxatdan o'tdingiz, ${created.name}! Endi obuna tanlashingiz mumkin.`,
          );
          return sendPlans(ctx);
        }

        default:
          return ctx.reply(
            'Nimadir noto‘g‘ri yoki bosqichni yo‘qotdingiz. /start bilan qayta boshlang.',
          );
      }
    });

    bot.action(/plan_(.+)/, async (ctx) => {
      try {
        await ctx.answerCbQuery();
        const userId = ctx.from!.id;
        const planId = ctx.match[1];
        const plan = plans.find((p) => p.id === planId);
        if (!plan) return;

        const session = getSession(userId);

        const admin = await prisma.admin.findUnique({
          where: { tgId: String(userId) },
        });
        if (!admin) {
          session.step = 'CHOOSE_AUTH';
          return ctx.reply(
            "🔒 Siz tizimga kirilgansiz emas. Iltimos /start orqali login qiling yoki ro'yxatdan o'ting.",
          );
        }

        session.selectedPlan = plan;
        session.awaitingPaymentProof = true;
        session.step = 'AWAITING_PAYMENT';

        await ctx.reply(
          `✅ Tanlandi: *${plan.name}*\n💰 Narxi: ${plan.price.toLocaleString()} so'm\n\n` +
            `💳 To'lovni quyidagi karta raqamiga o'tkazing:\n\`\`\`\n${CARD_NUMBER}\n\`\`\`\n\n` +
            `📸 Chekingizni (screenshot yoki foto) shu chatga yuboring.`,
          { parse_mode: 'Markdown' },
        );
      } catch (err) {
        console.error('plan action error', err);
      }
    });

    bot.on('photo', async (ctx) => {
      const userId = ctx.from!.id;
      const session = sessions.get(userId);
      if (!session?.awaitingPaymentProof || !session?.selectedPlan) return;

      try {
        const plan = session.selectedPlan;
        const fileArray = ctx.message!.photo!;
        const fileId = fileArray[fileArray.length - 1].file_id;

        const caption =
          `🔔 YANGI TO'LOV CHEKI\n\n` +
          `👤 Foydalanuvchi: ${ctx.from!.first_name} (@${ctx.from!.username || 'yoq'})\n` +
          `💳 Plan: ${plan.name}\n` +
          `💰 Summa: ${plan.price.toLocaleString()} so'm\n` +
          `🆔 TG ID: ${ctx.from!.id}\n\n` +
          `Tasdiqlash uchun tugmalardan birini bosing.`;

        await bot.telegram.sendPhoto(SUPER_ADMIN_ID, fileId, {
          caption,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✅ Tasdiqlash',
                  callback_data: `approve_${ctx.from!.id}`,
                },
              ],
              [
                {
                  text: '❌ Rad etish',
                  callback_data: `reject_${ctx.from!.id}`,
                },
              ],
            ],
          },
        });

        await ctx.reply(
          '📸 Chekingiz super-admin ga yuborildi. Tez orada tasdiqlanadi.',
        );
      } catch (err) {
        console.error('photo handler error', err);
        await ctx.reply('Xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.');
      }
    });

    bot.action(/approve_(\d+)/, async (ctx) => {
      try {
        await ctx.answerCbQuery();
        if (ctx.from!.id !== SUPER_ADMIN_ID)
          return ctx.answerCbQuery("Sizda ruxsat yo'q.");

        const userTgId = Number(ctx.match[1]);
        const session = sessions.get(userTgId);
        if (!session?.selectedPlan) {
          return ctx.reply(
            'Foydalanuvchi sessiyasi topilmadi yoki plan tanlanmagan.',
          );
        }

        const admin = await prisma.admin.findUnique({
          where: { tgId: String(userTgId) },
        });
        if (!admin) {
          await bot.telegram.sendMessage(
            userTgId,
            "✅ To'lov tasdiqlandi, ammo siz tizimda admin sifatida ro'yxatda emassiz. Iltimos, panel orqali ro'yxatdan o'ting.",
          );
          await ctx.editMessageCaption(
            (ctx.callbackQuery!.message as any).caption +
              '\n\n✅ TASDIQLANDI (lekin admin bazada topilmadi)',
          );
          sessions.delete(userTgId);
          return;
        }

        const plan = session.selectedPlan;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + plan.duration);

        await prisma.subscription.upsert({
          where: { adminId: admin.id },
          update: {
            type: plan.type as any,
            limit: plan.limit,
            subjectLimit: plan.subjects,
            expiresAt,
            active: true,
            verified: true,
          },
          create: {
            adminId: admin.id,
            type: plan.type as any,
            limit: plan.limit,
            subjectLimit: plan.subjects,
            expiresAt,
            active: true,
            verified: true,
          },
        });

        await bot.telegram.sendMessage(
          userTgId,
          `🎉 To'lov tasdiqlandi!\n🔥 ${plan.name} obunangiz faollashtirildi.\n⏳ Amal qilish muddati: ${plan.duration} oy.`,
        );

        try {
          await ctx.editMessageCaption(
            (ctx.callbackQuery!.message as any).caption + '\n\n✅ TASDIQLANDI',
          );
        } catch (e) {}

        sessions.delete(userTgId);
      } catch (err) {
        console.error('approve error', err);
      }
    });

    bot.action(/reject_(\d+)/, async (ctx) => {
      try {
        await ctx.answerCbQuery();
        if (ctx.from!.id !== SUPER_ADMIN_ID)
          return ctx.answerCbQuery("Sizda ruxsat yo'q.");

        const userTgId = Number(ctx.match[1]);
        const session = sessions.get(userTgId);

        await bot.telegram.sendMessage(
          userTgId,
          `❌ Kechirasiz, to'lov cheki qoniqarli topilmadi. Iltimos tekshirib qayta yuboring yoki admin bilan bog'laning.`,
        );

        try {
          await ctx.editMessageCaption(
            (ctx.callbackQuery!.message as any).caption + '\n\n❌ RAD ETILDI',
          );
        } catch (e) {}

        sessions.delete(userTgId);
      } catch (err) {
        console.error('reject error', err);
      }
    });

    process.once('SIGINT', () => {
      bot.stop('SIGINT');
      prisma.$disconnect();
    });
    process.once('SIGTERM', () => {
      bot.stop('SIGTERM');
      prisma.$disconnect();
    });

    bot.launch();
    this.logger.log(
      '🚀 Bot ishga tushdi — login + subscription tizimi tayyor.',
    );
  }
}
