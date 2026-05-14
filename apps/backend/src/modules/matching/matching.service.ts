import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { PricingService } from '../pricing/pricing.service';

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  distance: number;
}

@Injectable()
export class MatchingService {
  private readonly MAX_RADIUS_KM = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly pricing: PricingService,
  ) {}

  async findNearbyDrivers(lat: number, lng: number): Promise<DriverLocation[]> {
    // Get all online drivers from Redis
    const keys = await this.scanDriverLocations();
    const nearby: DriverLocation[] = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (!data) continue;

      const { driverId, lat: dLat, lng: dLng } = JSON.parse(data);
      const distance = this.pricing.haversineDistance(
        { lat, lng },
        { lat: dLat, lng: dLng },
      );

      if (distance <= this.MAX_RADIUS_KM) {
        nearby.push({ driverId, lat: dLat, lng: dLng, distance });
      }
    }

    return nearby.sort((a, b) => a.distance - b.distance);
  }

  async assignDriver(rideId: string, driverId: string) {
    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'BUSY' },
    });

    return this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId,
        status: 'DRIVER_ASSIGNED',
        acceptedAt: new Date(),
      },
      include: { driver: { include: { user: true, vehicles: true } } },
    });
  }

  async updateDriverLocation(driverId: string, lat: number, lng: number) {
    const key = `driver:location:${driverId}`;
    await this.redis.set(key, JSON.stringify({ driverId, lat, lng }), 120);
  }

  async removeDriverLocation(driverId: string) {
    await this.redis.del(`driver:location:${driverId}`);
  }

  private async scanDriverLocations(): Promise<string[]> {
    // Simple approach: check available drivers and their cached locations
    const drivers = await this.prisma.driver.findMany({
      where: { status: 'AVAILABLE' },
      select: { id: true },
    });
    return drivers.map((d) => `driver:location:${d.id}`);
  }
}
