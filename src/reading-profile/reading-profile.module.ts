import { Module } from '@nestjs/common';
import { ReadingProfileController } from './reading-profile.controller.js';
import { ReadingProfileService } from './reading-profile.service.js';

@Module({
  controllers: [ReadingProfileController],
  providers: [ReadingProfileService],
})
export class ReadingProfileModule {}