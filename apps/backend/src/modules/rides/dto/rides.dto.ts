import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestRideDto {
  @ApiProperty({ example: 'Calle Gran Vía 1, Madrid' })
  @IsString()
  originAddress: string;

  @ApiProperty({ example: 'Aeropuerto Barajas T4' })
  @IsString()
  destinationAddress: string;

  @ApiProperty({ example: 40.4168 })
  @IsNumber()
  originLat: number;

  @ApiProperty({ example: -3.7038 })
  @IsNumber()
  originLng: number;

  @ApiProperty({ example: 40.4722 })
  @IsNumber()
  destinationLat: number;

  @ApiProperty({ example: -3.5611 })
  @IsNumber()
  destinationLng: number;
}

export class CancelRideDto {
  @ApiPropertyOptional({ example: 'Changed my mind' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 40.4168 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -3.7038 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 45.5 })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsNumber()
  heading?: number;
}
