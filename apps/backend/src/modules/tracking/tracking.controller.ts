import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { UpdateLocationDto } from '../rides/dto/rides.dto';

@ApiTags('Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('location')
  @ApiOperation({ summary: 'Update driver location' })
  updateLocation(@Body() dto: UpdateLocationDto, @Body('driverId') driverId: string) {
    return this.trackingService.updateDriverLocation(driverId, dto);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get driver current location' })
  getDriverLocation(@Param('driverId') driverId: string) {
    return this.trackingService.getDriverLocation(driverId);
  }

  @Get('ride/:rideId')
  @ApiOperation({ summary: 'Get ride location history' })
  getRideLocations(@Param('rideId') rideId: string) {
    return this.trackingService.getRideLocations(rideId);
  }

  @Post('online')
  @ApiOperation({ summary: 'Set driver online' })
  goOnline(@Body() body: { driverId: string; latitude: number; longitude: number }) {
    return this.trackingService.setDriverOnline(body.driverId, body.latitude, body.longitude);
  }

  @Post('offline')
  @ApiOperation({ summary: 'Set driver offline' })
  goOffline(@Body() body: { driverId: string }) {
    return this.trackingService.setDriverOffline(body.driverId);
  }
}
