import { Controller, Post, Body } from '@nestjs/common';
import { CheatingService } from './cheating.service';

@Controller('cheating')
export class CheatingController {
  constructor(private readonly cheatingService: CheatingService) {}

  @Post('giveUserPremium')
  async giveUserPremium(@Body() email: string) {
    return this.cheatingService.giveUserPremium(email);
  }
}
