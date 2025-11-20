import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para crear un detalle de venta
 * Representa un producto individual en una venta
 */
export class CreateSaleDetailDto {
  @ApiProperty({
    description: 'ID del producto a vender',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  id_product: number;

  @ApiProperty({
    description: 'ID del lote específico (opcional, solo si aplica control de lotes)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_batch?: number;

  @ApiProperty({
    description: 'Cantidad del producto a vender',
    example: 10.5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
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
    description: 'Precio unitario del producto al momento de la venta',
    example: 15000.50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({
    description: 'Descuento aplicado a esta línea de detalle',
    example: 500.00,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({
    description: 'Subtotal de esta línea (quantity * unit_price - discount)',
    example: 145000.00,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({
    description: 'Notas adicionales sobre este producto en la venta',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

