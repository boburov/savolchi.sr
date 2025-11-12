const nodemailer = require("nodemailer");
require("dotenv").config();

const shouldSend = process.env.SEND_EMAIL !== "false";

let transporter = null;

if (shouldSend) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((err, success) => {
    if (err) console.error("❌ Mail transporter error:", err.message);
    else console.log("✅ Mail transporter tayyor.");
  });
}

async function sendVerificationCode(email, code) {
  if (!shouldSend || !transporter) {
    console.log(`[MAIL SKIP] to=${email} code=${code}`);
    return true;
  }

  const htmlTemplate = `
    <div style="max-width: 480px; margin: auto; background: #f9f9f9; border-radius: 12px; padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <h2 style="text-align: center; color: #2F80ED;">Savolchi Platformasi</h2>
      <p>Salom 👋</p>
      <p>Siz Savolchi platformasida ro‘yxatdan o‘tish yoki tizimga kirish uchun so‘rov yubordingiz.</p>
      <p>Iltimos, quyidagi tasdiqlash kodini kiriting:</p>
      <div style="text-align: center; margin: 20px 0;">
        <h1 style="display: inline-block; background: #2F80ED; color: #fff; padding: 10px 30px; border-radius: 8px; letter-spacing: 4px;">
          ${code}
        </h1>
      </div>
      <p style="color: #555;">⏰ Ushbu kod 15 daqiqa davomida amal qiladi.</p>
      <p>Agar siz bu so‘rovni qilmagan bo‘lsangiz, bu xabarni e’tiborsiz qoldiring.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="text-align: center; font-size: 13px; color: #888;">
        — Savolchi jamoasi
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Savolchi Platformasi" <${process.env.EMAIL}>`,
    to: email,
    subject: "Savolchi — Tasdiqlash Kodingiz",
    text: `Sizning tasdiqlash kodingiz: ${code}`,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email yuborildi: ${email}`);
    return true;
  } catch (err) {
    console.error("❌ Tasdiqlash xabarini yuborishda xato:", err.message);
    throw new Error("Mail yuborilmadi, keyinroq urinib ko‘ring.");
  }
}

module.exports = { sendVerificationCode };
