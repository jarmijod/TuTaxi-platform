import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RideStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { MatchingService } from '../matching/matching.service';
import { RequestRideDto, CancelRideDto } from './dto/rides.dto';

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly matching: MatchingService,
  ) {}

  async requestRide(clientId: string, dto: RequestRideDto) {
    const estimate = this.pricing.calculatePrice(
      { lat: dto.originLat, lng: dto.originLng },
      { lat: dto.destinationLat, lng: dto.destinationLng },
    );

    const ride = await this.prisma.ride.create({
      data: {
        clientId,
        originAddress: dto.originAddress,
        destinationAddress: dto.destinationAddress,
        originLat: dto.originLat,
        originLng: dto.originLng,
        destinationLat: dto.destinationLat,
        destinationLng: dto.destinationLng,
        distance: estimate.distance,
        duration: estimate.duration,
        price: estimate.price,
        status: 'SEARCHING_DRIVER',
      },
      include: { client: { select: { firstName: true, lastName: true, phone: true } } },
    });

    await this.addStatusHistory(ride.id, 'SEARCHING_DRIVER');

    // Find nearby drivers
    const nearbyDrivers = await this.matching.findNearbyDrivers(
      dto.originLat,
      dto.originLng,
    );

    return { ride, estimate, nearbyDrivers: nearbyDrivers.length };
  }

  async acceptRide(rideId: string, driverId: string) {
    const ride = await this.findRideOrFail(rideId);
    if (ride.status !== 'SEARCHING_DRIVER') {
      throw new BadRequestException('Ride is no longer available');
    }

    const updated = await this.matching.assignDriver(rideId, driverId);
    await this.addStatusHistory(rideId, 'DRIVER_ASSIGNED');
    return updated;
  }

  async updateStatus(rideId: string, status: RideStatus, userId: string) {
    const ride = await this.findRideOrFail(rideId);
    this.validateStatusTransition(ride.status, status);

    const data: any = { status };
    if (status === 'IN_PROGRESS') data.startedAt = new Date();
    if (status === 'COMPLETED') {
      data.completedAt = new Date();
      // Free driver
      if (ride.driverId) {
        await this.prisma.driver.update({
          where: { id: ride.driverId },
          data: { status: 'AVAILABLE', totalTrips: { increment: 1 } },
        });
      }
    }

    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data,
      include: {
        driver: { include: { user: { select: { firstName: true, lastName: true } } } },
        client: { select: { firstName: true, lastName: true } },
      },
    });

    await this.addStatusHistory(rideId, status);
    return updated;
  }

  async cancelRide(rideId: string, userId: string, dto: CancelRideDto) {
    const ride = await this.findRideOrFail(rideId);
    if (['COMPLETED', 'CANCELLED'].includes(ride.status)) {
      throw new BadRequestException('Cannot cancel this ride');
    }

    // Free driver if assigned
    if (ride.driverId) {
      await this.prisma.driver.update({
        where: { id: ride.driverId },
        data: { status: 'AVAILABLE' },
      });
    }

    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'CANCELLED',
        cancelReason: dto.reason,
        cancelledAt: new Date(),
      },
    });

    await this.addStatusHistory(rideId, 'CANCELLED');
    return updated;
  }

  async getRide(rideId: string) {
    return this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, phone: true } },
        driver: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true, avatar: true } },
            vehicles: { where: { status: 'ACTIVE' }, take: 1 },
          },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async getClientRides(clientId: string, page = 1, limit = 10) {
    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: { clientId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.ride.count({ where: { clientId } }),
    ]);
    return { rides, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getDriverRides(driverId: string, page = 1, limit = 10) {
    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: { driverId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.ride.count({ where: { driverId } }),
    ]);
    return { rides, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getActiveRide(userId: string) {
    return this.prisma.ride.findFirst({
      where: {
        OR: [{ clientId: userId }, { driver: { userId } }],
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      include: {
        client: { select: { firstName: true, lastName: true, phone: true } },
        driver: { include: { user: { select: { firstName: true, lastName: true, phone: true } }, vehicles: true } },
      },
    });
  }

  private async findRideOrFail(rideId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');
    return ride;
  }

  private validateStatusTransition(current: RideStatus, next: RideStatus) {
    const transitions: Record<string, string[]> = {
      SEARCHING_DRIVER: ['DRIVER_ASSIGNED', 'CANCELLED'],
      DRIVER_ASSIGNED: ['DRIVER_ARRIVING', 'CANCELLED'],
      DRIVER_ARRIVING: ['WAITING_PASSENGER', 'CANCELLED'],
      WAITING_PASSENGER: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    };
    if (!transitions[current]?.includes(next)) {
      throw new BadRequestException(`Cannot transition from ${current} to ${next}`);
    }
  }

  private async addStatusHistory(rideId: string, status: RideStatus) {
    await this.prisma.rideStatusHistory.create({ data: { rideId, status } });
  }
}
