import {
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar niveles de stock
 * Se usa internamente cuando hay movimientos de inventario
 */
export class UpdateStockDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  @IsInt()
  id_product: number;

  @ApiProperty({ description: 'ID de la bodega' })
  @IsNotEmpty()
  @IsInt()
  id_warehouse: number;

  @ApiProperty({
    description: 'Cantidad disponible',
    example: 100.5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity_available: number;

  @ApiProperty({
    description: 'Cantidad reservada',
    example: 20.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  reserved_quantity: number;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'kg',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  unit_type: string;

  @ApiProperty({
    description: 'ID del usuario que actualiza',
  })
  @IsNotEmpty()
  @IsInt()
  updated_by: number;
}

/**
 * DTO para reservar stock para una ruta
 */
export class ReserveStockDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  @IsInt()
  id_product: number;

  @ApiProperty({ description: 'ID de la bodega' })
  @IsNotEmpty()
  @IsInt()
  id_warehouse: number;

  @ApiProperty({
    description: 'Cantidad a reservar',
    example: 50.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'ID del usuario que reserva',
  })
  @IsNotEmpty()
  @IsInt()
  reserved_by: number;
}
