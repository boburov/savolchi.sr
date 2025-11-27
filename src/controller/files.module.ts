import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { BunnyService } from '../common/bunny.service';

@Module({
  controllers: [FilesController],
  providers: [BunnyService],
  exports: [BunnyService],
})
export class FilesModule {}
