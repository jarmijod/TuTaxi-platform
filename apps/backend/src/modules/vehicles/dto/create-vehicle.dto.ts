import { IsString, IsInt, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(2000)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 'Black' })
  @IsString()
  color: string;

  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'uuid-of-driver' })
  @IsUUID()
  driverId: string;
}
