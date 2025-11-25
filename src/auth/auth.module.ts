// src/auth/auth.module.ts
import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../service/redis.service';
import { MailerService } from '../service/mailer.service';
import { JwtAuthGuard } from './jwt_guard/jwt_guard.guard';
import { RolesGuard } from './jwt_guard/roles.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    PrismaService,
    RedisService,
    MailerService,
    JwtAuthGuard,    // ← BU YERGA QO‘SH!
    RolesGuard,      // ← BU YERGA QO‘SH!
  ],
  exports: [
    AuthService,
    JwtAuthGuard,    // ← BU YERGA QO‘SH!
    RolesGuard,      // ← BU YERGA QO‘SH!
  ],
})
export class AuthModule {}