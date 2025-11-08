const nodemailer = require("nodemailer");
require("dotenv").config();

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationCode(to, code) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Savolchi Platformasi" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Savolchi — Tasdiqlash Kodingiz",
        text: `Salom 👋\n\nSavolchi platformasiga kirish uchun sizning tasdiqlash kodingiz: ${code}\n\nBu kod 5 daqiqa davomida amal qiladi.`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Salom 👋</h2>
            <p>Savolchi platformasiga kirish uchun tasdiqlash kodingiz:</p>
            <h1 style="color: #2F80ED; letter-spacing: 4px;">${code}</h1>
            <p>⏰ Ushbu kod 15 daqiqa davomida amal qiladi.</p>
            <p>Agar siz bu so‘rovni qilmagan bo‘lsangiz, ushbu xabarni e’tiborsiz qoldiring.</p>
            <br/>
            <p style="font-size: 14px; color: #888;">— Savolchi jamoasi</p>
          </div>
        `,
      });

      console.log(`✅ Email muvaffaqiyatli yuborildi: ${to}`);
      return info;
    } catch (error) {
      console.error("❌ Email yuborishda xato:", error.message);
      throw new Error("Email yuborilmadi, keyinroq urinib ko‘ring.");
    }
  }
}

module.exports = new MailService();
