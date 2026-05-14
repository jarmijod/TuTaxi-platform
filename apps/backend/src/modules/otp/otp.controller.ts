import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

class SendOtpDto {
  phone: string;
}

class VerifyOtpDto {
  phone: string;
  code: string;
}

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  send(@Body() dto: SendOtpDto) {
    return this.otpService.sendOtp(dto.phone);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify OTP code' })
  verify(@Body() dto: VerifyOtpDto, @CurrentUser('id') userId: string) {
    return this.otpService.verifyOtp(dto.phone, dto.code, userId);
  }
}
