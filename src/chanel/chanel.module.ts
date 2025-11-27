import { Module } from '@nestjs/common';
import { ChanelService } from './chanel.service';
import { ChanelController } from './chanel.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BunnyService } from '../common/bunny.service';

@Module({
  controllers: [ChanelController],
  providers: [ChanelService, PrismaService, BunnyService],
})
export class ChanelModule {}
