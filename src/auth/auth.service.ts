import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../service/redis.service';
import { MailerService } from '../service/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailerService: MailerService,
  ) {}

  // Generate 6-digit code
  sixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // User Registration
  async createUser(dto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        username: dto.username,
      },
    });

    const sixDigitCode = this.sixDigitCode();

    await this.redisService.set(
      `email_verification_code:${user.email}`,
      sixDigitCode,
      900,
    );

    await this.mailerService.sendVerificationCodeEmail(
      user.email,
      sixDigitCode,
      user.username,
    );
    return { message: 'User registered. Please verify your email.', user };
  }

  // Email Verification
  async verifyEmail(email: string, code: string) {
    const storedCode = await this.redisService.get(
      `email_verification_code:${email}`,
    );

    if (storedCode !== code) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.user.update({
      where: { id: String(email) },
      data: { isVerified: true },
    });

    await this.redisService.del(`email_verification_code:${email}`);

    return { message: 'Email verified successfully' };
  }

  // User Validation
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const token = this.jwtService.sign(user);

    return { ...user, token };
  }

  // Verify User Token
  async verifyUserToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Admin Registration
  async createAdmin(dto: RegisterAdminDto) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (existingAdmin) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    const sixDigitCode = this.sixDigitCode();

    await this.redisService.set(
      `email_verification_code:admin:${admin.email}`,
      sixDigitCode,
      900,
    );

    await this.mailerService.sendVerificationCodeEmail(
      admin.email,
      sixDigitCode,
      admin.name,
    );

    return { message: 'Admin registered successfully', admin };
  }

  // Admin Validation
  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign(admin);

    return { ...admin, token };
  }

  // Admin Email Verification
  async verifyAdminEmail(email: string, code: string) {
    const storedCode = await this.redisService.get(
      `email_verification_code:admin:${email}`,
    );

    if (storedCode !== code) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const admin = await this.prisma.admin.update({
      where: { email },
      data: { isVerified: true },
    });

    await this.redisService.del(`email_verification_code:admin:${email}`);

    const token = this.jwtService.sign(admin);

    return { message: 'Admin email verified successfully', admin, token };
  }

  // Verify Admin Token
  async verifyAdminToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      const admin = await this.prisma.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          channel: {
            select: {
              id: true,
              name: true,
              pfp: true,
              banner: true,
              bio: true,
            },
          },
          subscription: {
            select: {
              id: true,
              type: true,
              limit: true,
              subjectLimit: true,
              expiresAt: true,
              active: true,
              verified: true,
            },
          },
        },
      });

      if (!admin) throw new UnauthorizedException('Invalid token');
      return admin;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
