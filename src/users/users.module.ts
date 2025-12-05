import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ResultModule } from './result/result.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  imports: [ResultModule],
})
export class UsersModule {}
