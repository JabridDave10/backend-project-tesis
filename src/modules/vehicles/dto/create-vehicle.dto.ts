import { IsNotEmpty, IsString, IsInt, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Matrícula o placa del vehículo' })
  @IsNotEmpty()
  @IsString()
  license_plate: string;

  @ApiProperty({ description: 'Tipo de vehículo (moto, carro, furgoneta, camion, camion_articulado)' })
  @IsNotEmpty()
  @IsString()
  vehicle_type: string;

  @ApiProperty({ description: 'Marca del vehículo' })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({ description: 'Modelo del vehículo' })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ description: 'Año de fabricación' })
  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  year: number;

  @ApiProperty({ description: 'Capacidad de peso en kg' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weight_capacity: number;

  @ApiProperty({ description: 'Capacidad volumétrica en m³', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_capacity?: number;

  @ApiProperty({ description: 'Estado del vehículo', required: false, default: 'activo' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Fecha de vencimiento del seguro/SOAT', required: false })
  @IsOptional()
  @IsDateString()
  insurance_expiry?: string;

  @ApiProperty({ description: 'Fecha de vencimiento de revisión técnica', required: false })
  @IsOptional()
  @IsDateString()
  technical_review_expiry?: string;

  @ApiProperty({ description: 'Kilometraje actual', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  current_mileage?: number;

  @ApiProperty({ description: 'ID del conductor asignado', required: false })
  @IsOptional()
  @IsInt()
  id_driver?: number;

  @ApiProperty({ description: 'URL de la foto del vehículo', required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ description: 'Notas u observaciones', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
