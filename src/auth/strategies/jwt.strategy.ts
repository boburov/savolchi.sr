import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: 'user' | 'admin' }) {
    const { sub, role } = payload;

    let user;
    if (role === 'admin') {
      user = await this.prisma.admin.findUnique({ where: { id: sub } });
    } else {
      user = await this.prisma.user.findUnique({ where: { id: sub } });
    }

    if (!user || !user.isVerified) {
      throw new UnauthorizedException('Invalid token or unverified account');
    }

    return { id: sub, email: payload.email, role };
  }
}