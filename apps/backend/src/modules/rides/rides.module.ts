import { Module } from '@nestjs/common';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { PricingModule } from '../pricing/pricing.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [PricingModule, MatchingModule],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
