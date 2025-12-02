import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteUnverifedUser() {
    await this.prisma.user.findMany({ where: { isVerified: false } });
    await this.prisma.admin.findMany({ where: { isVerified: false } });
    Logger.log("user va Adminlarni register bo'lmaganlarni ochirib tashlandi");
  }

  // User Registration
  @Post('register/user')
  async registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.createUser(dto);
  }

  // Email Verification
  @Post('validate/code')
  async validateCode(@Body() dto: VerifyEmailDto) {
    const { email, code } = dto;
    return this.authService.verifyEmail(email, code);
  }

  @Post('reset/user/password')
  async resetUserPassword(@Body() body: { email: string; password: string }) {
    return this.authService.userResetPassword(body.email, body.password);
  }

  // User Login
  @Post('login/user')
  async loginUser(@Body() dto: { email: string; password: string }) {
    return this.authService.validateUser(dto.email, dto.password);
  }

  // Admin Reset Password
  @Post('reset/admin/password')
  async resetPassword(@Body() data: { email: string; password: string }) {
    return this.authService.changeAdminPassword(data.email, data.password);
  }

  @Post('forgot/password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email talab qilinadi');
    }
    return this.authService.forgotPassword(email);
  }

  // Admin Login
  @Post('login/admin')
  async loginAdmin(@Body() dto: { email: string; password: string }) {
    return this.authService.validateAdmin(dto.email, dto.password);
  }

  // Admin Registration
  @Post('register/admin')
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.createAdmin(dto);
  }

  // Verify Admin Email
  @Post('validate/admin/code')
  async validateAdminCode(@Body() dto: VerifyEmailDto) {
    const { email, code } = dto;
    return this.authService.verifyAdminEmail(email, code);
  }

  // verify User Token
  @Post('verify/user/token')
  async verifyUserToken(@Body() dto: { token: string }) {
    return this.authService.verifyUserToken(dto.token);
  }

  // verify Admin Token
  @Post('verify/admin/token')
  async verifyAdminToken(@Body() dto: { token: string }) {
    return this.authService.verifyAdminToken(dto.token);
  }
}
