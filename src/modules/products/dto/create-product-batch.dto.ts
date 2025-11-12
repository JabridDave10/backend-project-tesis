import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BatchStatus } from '../enums/product.enums';

export class CreateProductBatchDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  @IsInt()
  id_product: number;

  @ApiProperty({ description: 'ID de la bodega donde se almacena el lote' })
  @IsNotEmpty()
  @IsInt()
  id_warehouse: number;

  @ApiProperty({
    description: 'Número de lote único',
    example: 'LOTE-2024-001',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  batch_number: string;

  @ApiProperty({
    description: 'Fecha de fabricación',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  manufactured_date?: string;

  @ApiProperty({
    description: 'Fecha de vencimiento',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @ApiProperty({
    description: 'Cantidad inicial del lote',
    example: 500.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  initial_quantity: number;

  @ApiProperty({
    description: 'Cantidad actual disponible',
    example: 450.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'kg',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  unit_type: string;

  @ApiProperty({
    description: 'Estado del lote',
    enum: BatchStatus,
    default: BatchStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiProperty({
    description: 'Notas adicionales sobre el lote',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateProductBatchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ required: false, enum: BatchStatus })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
