import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit: number = 50, page: number = 1) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        take: limit,
        skip: skip,
        select: {
          id: true,
          username: true,
          email: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(data: { id: string; username: string }) {
    const user = await this.prisma.user.findFirst({ where: { id: data.id } });

    if (!user) throw new HttpException('User Not Found', 404);

    await this.prisma.user.update({
      where: { id: data.id },
      data: {
        username: data.username,
      },
    });
  }

  async getResult(data: {
    userId: string;
    testId: string;
    isCorrect: boolean;
  }) {
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId },
    });

    const test = await this.prisma.test.findFirst({
      where: { id: data.testId },
    });

    if (!user || !test)
      throw new HttpException(
        'Siz Yuborgan Malumotlardan biri Mavjud emas',
        404,
      );

    if (user.isPremium === true) {
      await this.prisma.result.create({
        data: {
          userId: data.userId,
          testId: data.testId,
          xpEarned: 5,
        },
      });
      return { msg: 'premium obunachiga 5xp qoshildi' };
    } else if (data.isCorrect === true) {
      await this.prisma.result.create({
        data: {
          userId: data.userId,
          testId: data.testId,
          xpEarned: 5,
        },
      });
      return { msg: 'userga obuna qoshildi' };
    } else {
      await this.prisma.result.create({
        data: {
          userId: data.userId,
          testId: data.testId,
          xpEarned: -5,
        },
      });
      return { msg: 'userga obuna qoshildi' };
    }
  }
}
