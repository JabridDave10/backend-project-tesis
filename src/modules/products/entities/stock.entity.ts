import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from '../../warehouse/warehouse.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Stock Entity
 *
 * Control de inventario por producto y bodega.
 * Mantiene el stock disponible y reservado de cada producto en cada warehouse.
 */
@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn()
  id_stock: number;

  @Column('int')
  id_product: number;

  @Column('int')
  id_warehouse: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  quantity_available: number; // Cantidad disponible para despacho

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  reserved_quantity: number; // Cantidad reservada para rutas pendientes

  @Column('text')
  unit_type: string; // Unidad de medida (kg, litros, cajas, etc.)

  @UpdateDateColumn()
  last_updated: Date; // Última actualización

  @Column('int', { nullable: true })
  updated_by: number; // Usuario que realizó la última actualización

  // ==================== RELACIONES ====================

  @ManyToOne(() => Product, (product) => product.stocks)
  @JoinColumn({ name: 'id_product' })
  product: Product;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'id_warehouse' })
  warehouse: Warehouse;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  user: User;
}
