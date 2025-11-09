import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteProductDto {
  @ApiProperty({ description: 'ID de la ruta' })
  @IsNotEmpty()
  @IsInt()
  id_route: number;

  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  @IsInt()
  id_product: number;

  @ApiProperty({
    description: 'ID del lote específico (si aplica control de lotes)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_batch?: number;

  @ApiProperty({
    description: 'Cantidad transportada',
    example: 100.5,
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
    description: 'Notas sobre este producto en la ruta',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateRouteProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  id_batch?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
