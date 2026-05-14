import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RideStatus } from '@prisma/client';
import { RidesService } from './rides.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { RequestRideDto, CancelRideDto } from './dto/rides.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Rides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request a new ride' })
  requestRide(@CurrentUser('id') userId: string, @Body() dto: RequestRideDto) {
    return this.ridesService.requestRide(userId, dto);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a ride (driver)' })
  acceptRide(@Param('id') id: string, @Body() body: { driverId: string }) {
    return this.ridesService.acceptRide(id, body.driverId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ride status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RideStatus },
    @CurrentUser('id') userId: string,
  ) {
    return this.ridesService.updateStatus(id, body.status, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a ride' })
  cancelRide(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CancelRideDto,
  ) {
    return this.ridesService.cancelRide(id, userId, dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get current active ride' })
  getActiveRide(@CurrentUser('id') userId: string) {
    return this.ridesService.getActiveRide(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get ride history' })
  getHistory(@CurrentUser('id') userId: string, @Query() pagination: PaginationDto) {
    return this.ridesService.getClientRides(userId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ride details' })
  getRide(@Param('id') id: string) {
    return this.ridesService.getRide(id);
  }
}
