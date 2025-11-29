import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Injectable()
export class TestsService {
  private prisma = new PrismaClient();

  async create(createTestDto: CreateTestDto) {
    const { question, subjectId, options } = createTestDto;

    const test = await this.prisma.test.create({
      data: {
        question,
        subjectId,
        Option: {
          create: options,
        },
      },
      include: {
        Option: true,
      },
    });
    return test;
  }

  async findAll() {
    return this.prisma.test.findMany({
      include: { Option: true, Subject: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.test.findUnique({
      where: { id },
      include: { Option: true, Subject: true },
    });
  }

  async update(id: string, updateTestDto: UpdateTestDto) {
    const { question, subjectId, options } = updateTestDto;

    // testni update qilamiz
    const updatedTest = await this.prisma.test.update({
      where: { id },
      data: {
        question,
        subjectId,
      },
    });

    // agar options bo‘lsa, eski optionlarni o‘chirib, yangi optionlar qo‘shamiz
    if (options) {
      await this.prisma.option.deleteMany({ where: { testId: id } });
      await this.prisma.option.createMany({
        data: options.map((o) => ({ ...o, testId: id })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    return this.prisma.test.delete({ where: { id } });
  }
}
