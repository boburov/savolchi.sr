import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // User Registration
  @Post('register/user')
  async registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.createUser(dto);
  }

  // Email Verification
  @Post('validate/code')
  async validateCode(@Body() dto: VerifyEmailDto) {
    const { userId, code } = dto;
    return this.authService.verifyEmail(userId, code);
  }

  // User Login
  @Post('login/user')
  async loginUser(@Body() dto: { email: string; password: string }) {
    return this.authService.validateUser(dto.email, dto.password);
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
    const { userId, code } = dto;
    return this.authService.verifyAdminEmail(userId, code);
  }
}
