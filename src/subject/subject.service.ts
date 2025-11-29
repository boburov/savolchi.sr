import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        name: dto.name,
        channelId: dto.channelId,
      },
    });
  }

  async findAll() {
    return this.prisma.subject.findMany();
  }

  async findByChannel(channelId: string) {
    return this.prisma.subject.findMany({
      where: { channelId },
    });
  }

  async findTestsByChannel(channelId: string) {
    return this.prisma.test.findMany({
      where: {
        Subject: {
          channelId,
        },
      },
      include: {
        Option: true,
        Subject: true,
      },
    });
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const exists = await this.prisma.subject.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Subject topilmadi');

    return this.prisma.subject.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.subject.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Subject topilmadi');

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
