import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Nombre de la bodega' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Direccion de la bodega' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'ID de la compania' })
  @IsNotEmpty()
  @IsNumber()
  id_company: number;

  @ApiPropertyOptional({ description: 'ID de estado', default: 1 })
  @IsOptional()
  @IsNumber()
  id_status?: number;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: 'Nombre de la bodega' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Direccion de la bodega' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'ID de estado' })
  @IsOptional()
  @IsNumber()
  id_status?: number;
}
