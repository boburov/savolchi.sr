import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheatingService {
  constructor(private prisma: PrismaService) {}

  async giveUserPremium(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user) throw new HttpException('User Not Found', 404);

    await this.prisma.user.update({
      where: { email },
      data: {
        isPremium: true,
        usingTime: 1,
      },
    });

    return { msg: 'userga obuna qoshildi' };
  }

  
}
