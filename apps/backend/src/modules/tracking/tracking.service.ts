import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MatchingService } from '../matching/matching.service';
import { UpdateLocationDto } from '../rides/dto/rides.dto';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly matching: MatchingService,
  ) {}

  async updateDriverLocation(driverId: string, dto: UpdateLocationDto) {
    // Update in Redis for real-time matching
    await this.matching.updateDriverLocation(driverId, dto.latitude, dto.longitude);

    // If driver has active ride, save to DB
    const activeRide = await this.prisma.ride.findFirst({
      where: { driverId, status: { in: ['DRIVER_ARRIVING', 'IN_PROGRESS'] } },
    });

    if (activeRide) {
      await this.prisma.rideLocation.create({
        data: {
          rideId: activeRide.id,
          driverId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          speed: dto.speed,
          heading: dto.heading,
        },
      });
    }

    // Cache current location
    await this.redis.set(
      `driver:current:${driverId}`,
      JSON.stringify({ ...dto, updatedAt: Date.now() }),
      60,
    );

    return { success: true };
  }

  async getDriverLocation(driverId: string) {
    const cached = await this.redis.get(`driver:current:${driverId}`);
    if (cached) return JSON.parse(cached);
    return null;
  }

  async getRideLocations(rideId: string) {
    return this.prisma.rideLocation.findMany({
      where: { rideId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async setDriverOnline(driverId: string, lat: number, lng: number) {
    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'AVAILABLE' },
    });
    await this.matching.updateDriverLocation(driverId, lat, lng);
    return { status: 'online' };
  }

  async setDriverOffline(driverId: string) {
    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'OFFLINE' },
    });
    await this.matching.removeDriverLocation(driverId);
    return { status: 'offline' };
  }
}
