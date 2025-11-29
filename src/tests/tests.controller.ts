import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('create')
  create(@Body() createTestDto: CreateTestDto) {
    return this.testsService.create(createTestDto);
  }

  @Get('all')
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Patch('edit/:id')
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testsService.update(id, updateTestDto);
  }

  @Delete(':id/delete')
  remove(@Param('id') id: string) {
    return this.testsService.remove(id);
  }
}
