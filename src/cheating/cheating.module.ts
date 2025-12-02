import { Module } from '@nestjs/common';
import { CheatingService } from './cheating.service';
import { CheatingController } from './cheating.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CheatingController],
  providers: [CheatingService, PrismaService],
})
export class CheatingModule {}
