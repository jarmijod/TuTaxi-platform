import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../redis/redis.service';

interface JwtPayload {
  sub: string;
  email: string;
  roleName: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Check if token is blacklisted
    const isBlacklisted = await this.redis.exists(`blacklist:${payload.sub}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token revoked');
    }

    return { id: payload.sub, email: payload.email, roleName: payload.roleName };
  }
}
