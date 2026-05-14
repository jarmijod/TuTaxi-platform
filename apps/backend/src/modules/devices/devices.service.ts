import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async trackDevice(userId: string, ip?: string, userAgent?: string) {
    const deviceName = this.parseDeviceName(userAgent);

    // Upsert: update if same device, create if new
    const existing = await this.prisma.device.findFirst({
      where: { userId, userAgent },
    });

    if (existing) {
      return this.prisma.device.update({
        where: { id: existing.id },
        data: { ip, lastLogin: new Date() },
      });
    }

    return this.prisma.device.create({
      data: { userId, deviceName, ip, userAgent },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.device.findMany({
      where: { userId },
      orderBy: { lastLogin: 'desc' },
    });
  }

  async removeDevice(id: string, userId: string) {
    return this.prisma.device.deleteMany({ where: { id, userId } });
  }

  private parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    return 'Unknown Browser';
  }
}
