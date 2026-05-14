import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
