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
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

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

  async sendVerificationCodeEmail(
    to: string,
    code: string,
    name: string = 'Foydalanuvchi',
  ) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email tasdiqlash kodi</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 20px; }
        .container { max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .body { padding: 40px 30px; text-align: center; color: #333; }
        .code-box { 
          background: #f3e8ff; 
          border: 2px dashed #c4b5fd; 
          border-radius: 12px; 
          padding: 20px; 
          margin: 24px 0; 
          font-size: 36px; 
          font-weight: bold; 
          letter-spacing: 8px; 
          color: #6b21a8;
          display: inline-block;
        }
        .footer { background: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 14px; }
        .btn { 
          background: #8b5cf6; 
          color: #fff; 
          padding: 14px 32px; 
          text-decoration: none; 
          border-radius: 50px; 
          display: inline-block; 
          margin: 20px 0; 
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>QuizMaster</h1>
        </div>
        <div class="body">
          <h2>Salom, <strong>${name}</strong>! 👋</h2>
          <p>Ro'yxatdan o'tishni yakunlash uchun emailingizni tasdiqlang</p>
          
          <div class="code-box">${code}</div>
          
          <p>Yuqoridagi 6 xonali kodni ilovaga kiriting</p>
          <p><strong>Kod faqat 10 daqiqa amal qiladi ⏰</strong></p>
          
          <a href="${this.frontendUrl}" class="btn">Ilovaga qaytish</a>
        </div>
        <div class="footer">
          <p>Bu xatni siz so'ragansiz. Agar siz emas bo'lsangiz, e'tibor bermang.</p>
          <p>© 2025 QuizMaster. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await this.transporter.sendMail({
      from: `"QuizMaster" <${this.configService.get<string>('SMTP_USER')}>`,
      to,
      subject: '🔥 Tasdiqlash kodi | QuizMaster',
      html,
    });

    this.logger.log(`Verification CODE sent → ${to} | Code: ${code}`);
  }

  async sendPasswordResetCodeEmail(to: string, code: string) {
    const html = `
    <!DOCTYPE html>
    <html>
    <!-- shu yerda yuqoridagi dizaynni ozgina o'zgartirib qo'yamiz -->
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #ef4444, #f97316);">
          <h1>Parolni tiklash</h1>
        </div>
        <div class="body">
          <h2>Yangi parol o'rnatish</h2>
          <p>Parolingizni tiklash uchun quyidagi kodni kiriting:</p>
          <div class="code-box" style="background:#fee2e2; border-color:#fca5a5; color:#dc2626;">
            ${code}
          </div>
          <p><strong>10 daqiqa ichida ishlatishingiz kerak</strong></p>
        </div>
        <div class="footer">
          <p>Agar siz so'ramagan bo'lsangiz, bu xatni o'chirib tashlang.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await this.transporter.sendMail({
      from: `"SAVOLCHI" <${this.configService.get<string>('SMTP_USER')}>`,
      to,
      subject: '🔴 Parolni tiklash kodi',
      html,
    });
  }
}
