import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { StockMovement } from './stock-movement.entity';
import { RouteProduct } from './route-product.entity';
import { SalesDetail } from '../../sale/entities/sales_detail.entity';
import { BatchStatus } from '../enums/product.enums';

/**
 * ProductBatch Entity
 *
 * Control de lotes de productos para trazabilidad.
 * Permite rastrear productos por lote, fecha de fabricación y vencimiento.
 */
@Entity('product_batches')
export class ProductBatch {
  @PrimaryGeneratedColumn()
  id_batch: number;

  @Column('int')
  id_product: number;

  @Column('int')
  id_warehouse: number;

  @Column('text')
  batch_number: string; // Número de lote (ej: "LOT-2025-001")

  @Column('date', { nullable: true })
  manufactured_date: Date; // Fecha de fabricación

  @Column('date', { nullable: true })
  expiry_date: Date; // Fecha de vencimiento

  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number; // Cantidad en este lote

  @Column('text')
  unit_type: string; // Unidad de medida

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.AVAILABLE,
  })
  status: BatchStatus; // Estado del lote

  @Column('text', { nullable: true })
  notes: string; // Notas sobre el lote

  @CreateDateColumn()
  created_at: Date;

  // ==================== RELACIONES ====================

  @ManyToOne(() => Product, (product) => product.batches)
  @JoinColumn({ name: 'id_product' })
  product: Product;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'id_warehouse' })
  warehouse: Warehouse;

  @OneToMany(() => StockMovement, (movement) => movement.batch)
  stockMovements: StockMovement[];

  @OneToMany(() => RouteProduct, (routeProduct) => routeProduct.batch)
  routeProducts: RouteProduct[];

  @OneToMany(() => SalesDetail, (detail) => detail.batch)
  salesDetails: SalesDetail[];
}
