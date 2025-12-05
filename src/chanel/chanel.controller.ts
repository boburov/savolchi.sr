import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ChanelService } from './chanel.service';
import { CreateChanelDto } from './dto/create-chanel.dto';
import { UpdateChanelDto } from './dto/update-chanel.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

@Controller('chanel')
export class ChanelController {
  constructor(private readonly chanelService: ChanelService) {}

  @Post(':adminId')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pfp', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  create(
    @Param('adminId') adminId: string,
    @Body() dto: CreateChanelDto,
    @UploadedFiles()
    files: { pfp?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.chanelService.create(
      adminId,
      dto,
      files?.pfp?.[0],
      files?.banner?.[0],
    );
  }

  @Get()
  getAll() {
    return this.chanelService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.chanelService.getOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pfp', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChanelDto,
    @UploadedFiles()
    files: { pfp?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.chanelService.update(
      id,
      dto,
      files?.pfp?.[0],
      files?.banner?.[0],
    );
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.chanelService.delete(id);
  }
}
