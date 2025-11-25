// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RedisService } from '../service/redis.service';
import { MailerService } from '../service/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailerService: MailerService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already taken');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hash,
      },
    });

    const token = randomBytes(32).toString('hex');
    await this.redisService.setVerificationToken(dto.email, token);
    await this.mailerService.sendVerificationEmail(dto.email, token, dto.username);

    return { message: 'User created! Check your email to verify.' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const storedToken = await this.redisService.getVerificationToken(dto.email);
    if (!storedToken || storedToken !== dto.token) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Update both User and Admin if exists
    await this.prisma.user.updateMany({
      where: { email: dto.email },
      data: { isVerified: true },
    });

    await this.prisma.admin.updateMany({
      where: { email: dto.email },
      data: { isVerified: true },
    });

    await this.redisService.deleteVerificationToken(dto.email);
    return { message: 'Email verified successfully! 🎉' };
  }

  async login(email: string, password: string, role: 'user' | 'admin') {
    const model = role === 'admin' ? this.prisma.admin : this.prisma.user;
    const entity = await this.prisma.user.findUnique({ where: { email } });

    if (!entity || !(await bcrypt.compare(password, entity.password))) {
      throw new UnauthorizedException('Wrong credentials');
    }

    if (!entity.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const payload = { sub: entity.id, email: entity.email, role };
    return {
      access_token: this.jwtService.sign(payload),
      role,
    };
  }
}