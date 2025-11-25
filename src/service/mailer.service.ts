// src/common/mailer/mailer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;
  private readonly logger = new Logger(MailerService.name);
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, token: string, name: string = 'User') {
    const verifyLink = `${this.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

    await this.transporter.sendMail({
      from: `"QuizMaster" <${this.configService.get<string>('SMTP_USER')}>`,
      to,
      subject: '✅ Emailingizni tasdiqlang | QuizMaster',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; border-radius: 12px;">
          <h2>Salom, <strong>${name}</strong>! 👋</h2>
          <p>QuizMaster platformasida ro'yxatdan o'tganingiz uchun rahmat!</p>
          <p>Emailingizni tasdiqlash uchun quyidagi tugmani bosing:</p>
          <a href="${verifyLink}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">
            Emailni Tasdiqlash
          </a>
          <p>Yoki link: <a href="${verifyLink}">${verifyLink}</a></p>
          <p><small>Bu link 10 daqiqadan keyin ishlamaydi ⏰</small></p>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${to}`);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

    await this.transporter.sendMail({
      from: `"QuizMaster" <${this.configService.get<string>('SMTP_USER')}>`,
      to,
      subject: '🔑 Parolni tiklash',
      html: `
        <h3>Parolni tiklash so'rovi</h3>
        <p>Yangi parol o'rnatish uchun: <a href="${resetLink}">bu yerga bosing</a></p>
        <p>Link 15 daqiqadan keyin o'chadi.</p>
      `,
    });
  }
}