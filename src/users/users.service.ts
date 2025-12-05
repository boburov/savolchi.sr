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
          isVerified: true,
          email: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.user.count(),
    ]);

    return {
      users,
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
}
