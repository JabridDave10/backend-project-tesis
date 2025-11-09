import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnitTypeEnum } from '../enums/product.enums';

export class CreateProductDto {
  @ApiProperty({ description: 'ID de la compañía' })
  @IsNotEmpty()
  @IsInt()
  id_company: number;

  @ApiProperty({
    description: 'ID de la categoría',
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_category?: number;

  // ==================== IDENTIFICACIÓN ====================

  @ApiProperty({
    description: 'Código SKU único del producto',
    example: 'PROD-001',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Leche Entera 1L',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Descripción detallada',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // ==================== UNIDADES DE MEDIDA ====================

  @ApiProperty({
    description: 'Tipo principal de unidad',
    enum: UnitTypeEnum,
    example: UnitTypeEnum.WEIGHT,
  })
  @IsNotEmpty()
  @IsEnum(UnitTypeEnum)
  primary_unit_type: UnitTypeEnum;

  @ApiProperty({
    description: 'Nombre de la unidad',
    example: 'kg',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  primary_unit_name: string;

  @ApiProperty({
    description: 'Peso por unidad en kg',
    required: false,
    example: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_per_unit?: number;

  @ApiProperty({
    description: 'Volumen por unidad en m³',
    required: false,
    example: 0.001,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_per_unit?: number;

  // ==================== DIMENSIONES FÍSICAS ====================

  @ApiProperty({
    description: 'Ancho en cm',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiProperty({
    description: 'Alto en cm',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiProperty({
    description: 'Largo en cm',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  // ==================== CONDICIONES DE ALMACENAMIENTO ====================

  @ApiProperty({
    description: 'Requiere refrigeración',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requires_refrigeration?: boolean;

  @ApiProperty({
    description: 'Temperatura mínima en °C',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  min_temperature?: number;

  @ApiProperty({
    description: 'Temperatura máxima en °C',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  max_temperature?: number;

  @ApiProperty({
    description: 'Es frágil (manejo con cuidado)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_fragile?: boolean;

  @ApiProperty({
    description: 'Es material peligroso',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_hazardous?: boolean;

  // ==================== CONTROL Y TRAZABILIDAD ====================

  @ApiProperty({
    description: 'Requiere control de lotes',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requires_batch_control?: boolean;

  @ApiProperty({
    description: 'Requiere fecha de vencimiento',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requires_expiry_date?: boolean;

  // ==================== INFORMACIÓN ADICIONAL ====================

  @ApiProperty({
    description: 'URL de la foto del producto',
    required: false,
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({
    description: 'Notas adicionales',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  id_category?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, enum: UnitTypeEnum })
  @IsOptional()
  @IsEnum(UnitTypeEnum)
  primary_unit_type?: UnitTypeEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  primary_unit_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_per_unit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume_per_unit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requires_refrigeration?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  min_temperature?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max_temperature?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_fragile?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_hazardous?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requires_batch_control?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requires_expiry_date?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
