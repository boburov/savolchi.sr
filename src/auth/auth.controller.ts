import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalUserGuard, LocalAdminGuard } from './strategies/local-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/user')
  async registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('register/admin')
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return { message: 'Admin registration via Telegram only' };
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('login/user')
  @UseGuards(LocalUserGuard()) // <-- shunday!
  loginUser(@Req() req: any) {
    return req.user;
  }

  @Post('login/admin')
  @UseGuards(LocalAdminGuard()) // <-- shunday!
  loginAdmin(@Req() req: any) {
    return req.user;
  }
}
