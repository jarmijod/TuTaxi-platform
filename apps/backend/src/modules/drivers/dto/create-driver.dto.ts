import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({ example: 'DL-123456789' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  userId: string;
}
