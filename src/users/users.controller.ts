import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('limit') limit = '50', @Query('page') page = '1') {
    return this.usersService.findAll(+limit, +page);
  }

  @Post('giveResult')
  async giveResult(
    @Body() data: { userId: string; testId: string; isCorrect: boolean },
  ) {
    return this.usersService.getResult(data);
  }

  @Put('update')
  async update(@Body() data: { id: string; username: string }) {
    return this.usersService.update(data);
  }
}
