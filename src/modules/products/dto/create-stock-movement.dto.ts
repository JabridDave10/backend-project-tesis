import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '../enums/product.enums';

export class CreateStockMovementDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  @IsInt()
  id_product: number;

  @ApiProperty({
    description: 'ID de la bodega de origen',
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_warehouse_origin?: number;

  @ApiProperty({
    description: 'ID de la bodega de destino',
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_warehouse_destination?: number;

  @ApiProperty({
    description: 'ID del lote (si aplica control de lotes)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_batch?: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.ENTRY,
  })
  @IsNotEmpty()
  @IsEnum(MovementType)
  movement_type: MovementType;

  @ApiProperty({
    description: 'Cantidad del movimiento',
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
    description: 'Número de referencia (factura, orden, etc.)',
    required: false,
    example: 'FAC-2024-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference_number?: string;

  @ApiProperty({
    description: 'Notas sobre el movimiento',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    description: 'ID del usuario que registra el movimiento',
  })
  @IsNotEmpty()
  @IsInt()
  created_by: number;
}
