import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Route } from '../../routes/entities/route.entity';
import { Product } from './product.entity';
import { ProductBatch } from './product-batch.entity';

/**
 * RouteProduct Entity
 *
 * Relación entre rutas y productos transportados.
 * Permite registrar qué productos y en qué cantidad se transportan en cada ruta.
 */
@Entity('route_products')
export class RouteProduct {
  @PrimaryGeneratedColumn()
  id_route_product: number;

  @Column('int')
  id_route: number;

  @Column('int')
  id_product: number;

  @Column('int', { nullable: true })
  id_batch: number; // Lote específico (si aplica control de lotes)

  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number; // Cantidad transportada

  @Column('text')
  unit_type: string; // Unidad de medida (kg, litros, cajas, etc.)

  @Column('text', { nullable: true })
  notes: string; // Notas sobre este producto en la ruta

  @CreateDateColumn()
  created_at: Date;

  // ==================== RELACIONES ====================
  // Comentadas porque usamos raw SQL queries, no repositorios TypeORM

  // @ManyToOne(() => Route)
  // @JoinColumn({ name: 'id_route' })
  // route: Route;

  // @ManyToOne(() => Product)
  // @JoinColumn({ name: 'id_product' })
  // product: Product;

  // @ManyToOne(() => ProductBatch, { nullable: true })
  // @JoinColumn({ name: 'id_batch' })
  // batch: ProductBatch;
}
