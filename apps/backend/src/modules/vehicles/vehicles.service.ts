import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: dto,
      include: { driver: true },
    });
  }

  async findAll(page = 1, limit = 10) {
    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { driver: { include: { user: { select: { firstName: true, lastName: true } } } } },
      }),
      this.prisma.vehicle.count(),
    ]);
    return { vehicles, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { driver: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }
}
