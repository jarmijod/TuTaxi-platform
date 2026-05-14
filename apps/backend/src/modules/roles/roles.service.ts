import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({ include: { _count: { select: { users: true } } } });
  }

  async findByName(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(name: string, permissions: string[]) {
    return this.prisma.role.create({ data: { name, permissions } });
  }

  async updatePermissions(id: string, permissions: string[]) {
    return this.prisma.role.update({ where: { id }, data: { permissions } });
  }
}
