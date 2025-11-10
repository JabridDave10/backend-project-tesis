import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StorageType } from '../enums/product.enums';

export class CreateProductCategoryDto {
  @ApiProperty({ description: 'ID de la compañía' })
  @IsNotEmpty()
  @IsInt()
  id_company: number;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Perecederos',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    required: false,
    example: 'Productos que requieren refrigeración',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Tipo de almacenamiento por defecto',
    enum: StorageType,
    default: StorageType.AMBIENT,
  })
  @IsOptional()
  @IsEnum(StorageType)
  default_storage_type?: StorageType;

  @ApiProperty({
    description: 'Icono (emoji o nombre)',
    required: false,
    example: '🍎',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    description: 'Color hexadecimal para UI',
    required: false,
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}

export class UpdateProductCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, enum: StorageType })
  @IsOptional()
  @IsEnum(StorageType)
  default_storage_type?: StorageType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
