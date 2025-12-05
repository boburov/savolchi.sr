import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}

  async getResult(data: {
    userId: string;
    testId: string;
    optionId: string;
    isSkipped: boolean;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) throw new HttpException('Bunday User Mavjud Emas', 404);

    const test = await this.prisma.test.findUnique({
      where: { id: data.testId },
    });

    if (!test)
      throw new HttpException('Kechirasiz Bunday Test Mavjud Emas', 404);

    const option = await this.prisma.option.findUnique({
      where: { id: data.optionId },
    });

    if (!option)
      throw new HttpException('Kechirasiz BUnday Javob Mavjud Emas', 404);

    const xp = 100;
    if (data.isSkipped === false && option.isCorrect === true) {
      await this.prisma.result.create({
        data: {
          isSkiped: data.isSkipped,
          xpEarned: xp,
          optionId: data.optionId,
          testId: data.testId,
          userId: data.userId,
        },
      });

      await this.prisma.user.update({
        where: { id: data.userId },
        data: {
          xp: { increment: xp },
        },
      });
    } else {
      await this.prisma.result.create({
        data: {
          isSkiped: data.isSkipped,
          xpEarned: -xp,
          optionId: data.optionId,
          testId: data.testId,
          userId: data.userId,
        },
      });

      await this.prisma.user.update({
        where: { id: data.userId },
        data: {
          xp: { decrement: xp },
        },
      });
    }
  }
}
