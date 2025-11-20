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
import { Product } from './product.entity';
import { StorageType } from '../enums/product.enums';

/**
 * ProductCategory Entity
 *
 * Categorías de productos configurables por cada compañía.
 * Permite a cada empresa definir sus propias categorías (Perecederos, Refrigerados, etc.)
 */
@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id_category: number;

  @Column('int')
  id_company: number;

  @Column('text')
  name: string; // ej: "Perecederos", "Refrigerados", "Secos", "Químicos"

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: StorageType,
    default: StorageType.AMBIENT,
  })
  default_storage_type: StorageType; // Tipo de almacenamiento por defecto para esta categoría

  @Column('text', { nullable: true })
  icon: string; // Emoji o nombre de icono (ej: "🍎", "❄️", "📦")

  @Column('text', { nullable: true })
  color: string; // Color hex para UI (ej: "#FF5733")

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

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
