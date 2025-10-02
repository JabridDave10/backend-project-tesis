import { IsNotEmpty, IsString, IsInt, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({ description: 'Código único de la ruta' })
  @IsNotEmpty()
  @IsString()
  route_code: string;

  @ApiProperty({ description: 'ID del conductor asignado', required: false })
  @IsOptional()
  @IsInt()
  id_driver?: number;

  @ApiProperty({ description: 'ID del vehículo asignado', required: false })
  @IsOptional()
  @IsInt()
  id_vehicle?: number;

  @ApiProperty({ description: 'Dirección de origen' })
  @IsNotEmpty()
  @IsString()
  origin_address: string;

  @ApiProperty({ description: 'Latitud de origen', required: false })
  @IsOptional()
  @IsNumber()
  origin_latitude?: number;

  @ApiProperty({ description: 'Longitud de origen', required: false })
  @IsOptional()
  @IsNumber()
  origin_longitude?: number;

  @ApiProperty({ description: 'Dirección de destino' })
  @IsNotEmpty()
  @IsString()
  destination_address: string;

  @ApiProperty({ description: 'Latitud de destino', required: false })
  @IsOptional()
  @IsNumber()
  destination_latitude?: number;

  @ApiProperty({ description: 'Longitud de destino', required: false })
  @IsOptional()
  @IsNumber()
  destination_longitude?: number;

  @ApiProperty({ description: 'Peso de la carga en kg' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cargo_weight: number;

  @ApiProperty({ description: 'Volumen de la carga en m³', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cargo_volume?: number;

  @ApiProperty({ description: 'Descripción de la carga', required: false })
  @IsOptional()
  @IsString()
  cargo_description?: string;

  @ApiProperty({ description: 'Estado de la ruta', required: false, default: 'pendiente' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Distancia estimada en km', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_distance?: number;

  @ApiProperty({ description: 'Duración estimada en minutos', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimated_duration?: number;

  @ApiProperty({ description: 'Costo estimado', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_cost?: number;

  @ApiProperty({ description: 'Fecha programada', required: false })
  @IsOptional()
  @IsDateString()
  scheduled_date?: string;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
