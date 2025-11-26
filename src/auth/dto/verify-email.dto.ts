// src/auth/dto/verify-email.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  userId: string;

  @IsString()
  code: string;
}
