import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { ProductCategory } from './product-category.entity';
import { Stock } from './stock.entity';
import { ProductBatch } from './product-batch.entity';
import { RouteProduct } from './route-product.entity';
import { SalesDetail } from '../../sale/entities/sales_detail.entity';
import { UnitTypeEnum } from '../enums/product.enums';

/**
 * Product Entity
 *
 * Catálogo de productos flexible y configurable.
 * Soporta múltiples tipos de medición, almacenamiento especial, y trazabilidad.
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id_product: number;

  @Column('int')
  id_company: number;

  @Column('int', { nullable: true })
  id_category: number;

  // ==================== IDENTIFICACIÓN ====================

  @Column('text', { unique: true })
  sku: string; // Código único del producto (Stock Keeping Unit)

  @Column('text')
  name: string; // Nombre del producto

  @Column('text', { nullable: true })
  description: string; // Descripción detallada

  // ==================== UNIDADES DE MEDIDA ====================

  @Column({
    type: 'enum',
    enum: UnitTypeEnum,
  })
  primary_unit_type: UnitTypeEnum; // Tipo principal (weight, volume, unit, etc.)

  @Column('text')
  primary_unit_name: string; // Nombre de la unidad (kg, litros, cajas, etc.)

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  weight_per_unit: number; // Peso de cada unidad en kg (útil si se vende por unidad)

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  volume_per_unit: number; // Volumen de cada unidad en m³

  // ==================== DIMENSIONES FÍSICAS ====================
  // Para calcular espacio en vehículo

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  width: number; // Ancho en cm

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  height: number; // Alto en cm

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  length: number; // Largo en cm

  // ==================== CONDICIONES DE ALMACENAMIENTO ====================

  @Column('boolean', { default: false })
  requires_refrigeration: boolean; // Requiere refrigeración

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  min_temperature: number; // Temperatura mínima en °C

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  max_temperature: number; // Temperatura máxima en °C

  @Column('boolean', { default: false })
  is_fragile: boolean; // Es frágil (manejo con cuidado)

  @Column('boolean', { default: false })
  is_hazardous: boolean; // Es material peligroso

  // ==================== CONTROL Y TRAZABILIDAD ====================

  @Column('boolean', { default: false })
  requires_batch_control: boolean; // Requiere control de lotes

  @Column('boolean', { default: false })
  requires_expiry_date: boolean; // Requiere fecha de vencimiento

  // ==================== INFORMACIÓN ADICIONAL ====================

  @Column('text', { nullable: true })
  photo: string; // URL de la foto del producto

  @Column('text', { nullable: true })
  notes: string; // Notas adicionales

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // ==================== RELACIONES ====================

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'id_company' })
  company: Company;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'id_category' })
  category: ProductCategory;

  @OneToMany(() => Stock, (stock) => stock.product)
  stocks: Stock[];

  @OneToMany(() => ProductBatch, (batch) => batch.product)
  batches: ProductBatch[];

  @OneToMany(() => RouteProduct, (routeProduct) => routeProduct.product)
  routeProducts: RouteProduct[];

  @OneToMany(() => SalesDetail, (detail) => detail.product)
  salesDetails: SalesDetail[];
}
