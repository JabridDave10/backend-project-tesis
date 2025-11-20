import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateSaleDetailDto } from './create-sale-detail.dto';

/**
 * DTO para crear una venta completa
 * Incluye la información de la venta y sus detalles (productos)
 */
export class CreateSaleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sale_number?: string;

  @IsNotEmpty()
  @IsInt()
  id_client: number;

  @IsNotEmpty()
  @IsInt()
  id_company: number;

  @IsNotEmpty()
  @IsInt()
  id_user: number;

  @IsOptional()
  @IsInt()
  id_route?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment_method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment_status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDetailDto)
  details: CreateSaleDetailDto[];
}

