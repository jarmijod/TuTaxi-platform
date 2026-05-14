import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { UsersService } from '../users/users.service';
import { DevicesService } from '../devices/devices.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly devicesService: DevicesService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) throw new ConflictException('Email already registered');

    if (dto.phone) {
      const existingPhone = await this.usersService.findByPhone(dto.phone);
      if (existingPhone) throw new ConflictException('Phone already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    let role = await this.prisma.role.findUnique({ where: { name: dto.role || 'CLIENT' } });
    if (!role) {
      role = await this.prisma.role.create({
        data: { name: dto.role || 'CLIENT', permissions: [] },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: role.id,
      },
      include: { role: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, role.name);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Account suspended');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Track device
    if (ip || userAgent) {
      await this.devicesService.trackDevice(user.id, ip, userAgent);
    }

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role.name,
    );
    await this.saveRefreshToken(stored.user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(stored.user),
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revoked: true },
      });
    } else {
      // Revoke all tokens
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
    }
    // Blacklist access token in Redis (15min TTL)
    await this.redis.set(`blacklist:${userId}`, '1', 900);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, driver: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, email: string, roleName: string) {
    const payload = { sub: userId, email, roleName };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuid();

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
