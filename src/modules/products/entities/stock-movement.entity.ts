import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { ProductBatch } from './product-batch.entity';
import { User } from '../../users/entities/user.entity';
import { MovementType } from '../enums/product.enums';

/**
 * StockMovement Entity
 *
 * Registro de todos los movimientos de inventario.
 * Proporciona trazabilidad completa de entradas, salidas y transferencias.
 */
@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id_movement: number;

  @Column('int')
  id_product: number;

  @Column('int', { nullable: true })
  id_warehouse_origin: number; // Bodega de origen (null si es entrada)

  @Column('int', { nullable: true })
  id_warehouse_destination: number; // Bodega de destino (null si es salida)

  @Column('int', { nullable: true })
  id_batch: number; // Lote asociado (si aplica)

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  movement_type: MovementType; // Tipo de movimiento

  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number; // Cantidad movida

  @Column('text')
  unit_type: string; // Unidad de medida

  @Column('text', { nullable: true })
  reference_number: string; // Número de referencia (orden, factura, ruta, etc.)

  @Column('text', { nullable: true })
  notes: string; // Notas sobre el movimiento

  @Column('int')
  created_by: number; // Usuario que realizó el movimiento

  @CreateDateColumn()
  created_at: Date;

  // ==================== RELACIONES ====================

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_product' })
  product: Product;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'id_warehouse_origin' })
  warehouseOrigin: Warehouse;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'id_warehouse_destination' })
  warehouseDestination: Warehouse;

  @ManyToOne(() => ProductBatch, { nullable: true })
  @JoinColumn({ name: 'id_batch' })
  batch: ProductBatch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  user: User;
}
