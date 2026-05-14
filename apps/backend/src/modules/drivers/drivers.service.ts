import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: dto,
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  async findAll(page = 1, limit = 10) {
    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
      this.prisma.driver.count(),
    ]);
    return { drivers, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { user: true, vehicles: true },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }
}
