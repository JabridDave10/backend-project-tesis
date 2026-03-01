import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class SendPositionDto {
  @ApiProperty({ description: 'ID del conductor' })
  @IsNotEmpty()
  @IsNumber()
  id_driver: number;

  @ApiProperty({ description: 'Latitud', minimum: -90, maximum: 90 })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitud', minimum: -180, maximum: 180 })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ description: 'Velocidad en km/h', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @ApiProperty({ description: 'Direccion en grados (0-360)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiProperty({ description: 'Precision GPS en metros', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @ApiProperty({ description: 'Estado del conductor', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'ID del vehiculo', required: false })
  @IsOptional()
  @IsNumber()
  id_vehicle?: number;

  @ApiProperty({ description: 'ID de la ruta', required: false })
  @IsOptional()
  @IsNumber()
  id_route?: number;
}
