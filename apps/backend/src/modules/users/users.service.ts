import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { role: true } });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, driver: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  async findAll(page = 1, limit = 10) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: { role: true },
    });
    const { password, ...rest } = user;
    return rest;
  }

  async updateAvatar(userId: string, avatarPath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: { id: true, avatar: true },
    });
  }

  async verifyPhone(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true, status: 'ACTIVE' },
    });
  }
}
