import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly usersService: UsersService,
  ) {}

  async sendOtp(phone: string) {
    // Rate limit: 1 OTP per minute per phone
    const rateLimitKey = `otp:ratelimit:${phone}`;
    if (await this.redis.exists(rateLimitKey)) {
      throw new BadRequestException('Please wait before requesting another OTP');
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.create({
      data: { phone, code, expiresAt },
    });

    // Cache in Redis for fast lookup
    await this.redis.set(`otp:${phone}`, code, 300);
    await this.redis.set(rateLimitKey, '1', 60);

    // TODO: Integrate Twilio/SMS provider here
    // For development, log the code
    console.log(`📱 OTP for ${phone}: ${code}`);

    return { message: 'OTP sent successfully', expiresIn: 300 };
  }

  async verifyOtp(phone: string, code: string, userId?: string) {
    const cachedCode = await this.redis.get(`otp:${phone}`);

    if (cachedCode !== code) {
      // Fallback to DB
      const otpRecord = await this.prisma.otpCode.findFirst({
        where: { phone, code, verified: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });
    }

    await this.redis.del(`otp:${phone}`);

    // Mark phone as verified if userId provided
    if (userId) {
      await this.usersService.verifyPhone(userId);
    }

    return { message: 'Phone verified successfully', verified: true };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
