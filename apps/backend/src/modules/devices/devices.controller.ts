import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all devices for current user' })
  findAll(@CurrentUser('id') userId: string) {
    return this.devicesService.findByUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a device session' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.devicesService.removeDevice(id, userId);
  }
}
