import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectService.create(dto);
  }

  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  @Get('channel/:channelId')
  findByChannel(@Param('channelId') channelId: string) {
    return this.subjectService.findByChannel(channelId);
  }

  @Get('channel/:channelId/test')
  findTests(@Param('channelId') channelId: string) {
    return this.subjectService.findTestsByChannel(channelId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(id);
  }
}
