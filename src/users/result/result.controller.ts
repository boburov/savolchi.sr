import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ResultService } from './result.service';

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post('create')
  async create(
    @Body()
    dto: {
      userId: string;
      testId: string;
      optionId: string;
      isSkipped: boolean;
    },
  ) {
    return this.resultService.getResult(dto);
  }
}
