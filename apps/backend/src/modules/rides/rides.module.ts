import { Module } from '@nestjs/common';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { PricingModule } from '../pricing/pricing.module';
import { MatchingModule } from '../matching/matching.module';
import { SocketsModule } from '../sockets/sockets.module';

@Module({
  imports: [PricingModule, MatchingModule, SocketsModule],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
