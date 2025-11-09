import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { UnitTypeEnum } from '../../products/enums/product.enums';

/**
 * CompanySettings Entity
 *
 * Configuración del módulo de productos para cada compañía.
 * Permite habilitar/deshabilitar funcionalidades según las necesidades de cada empresa.
 */
@Entity('company_settings')
export class CompanySettings {
  @PrimaryGeneratedColumn()
  id_setting: number;

  @Column('int', { unique: true })
  id_company: number;

  // ==================== CONFIGURACIÓN DE INVENTARIO ====================

  @Column('boolean', { default: true })
  enable_stock_control: boolean; // ¿La compañía maneja control de stock?

  @Column('boolean', { default: false })
  enable_batch_control: boolean; // ¿Requiere control de lotes?

  @Column('boolean', { default: false })
  enable_multiple_warehouses: boolean; // ¿Usa múltiples bodegas?

  // ==================== CONFIGURACIÓN DE UNIDADES ====================

  @Column({
    type: 'enum',
    enum: UnitTypeEnum,
    default: UnitTypeEnum.WEIGHT,
  })
  default_unit_type: UnitTypeEnum; // Tipo de unidad por defecto

  @Column('text', { default: 'kg' })
  default_unit_name: string; // Nombre de unidad por defecto

  // ==================== CONFIGURACIÓN DE ALERTAS ====================

  @Column('int', { default: 30 })
  days_before_expiry_alert: number; // Días antes del vencimiento para alertar

  @Column('boolean', { default: true })
  enable_low_stock_alerts: boolean; // ¿Alertas de stock bajo?

  @Column('decimal', { precision: 5, scale: 2, default: 10 })
  low_stock_threshold_percent: number; // % de stock mínimo para alertar

  // ==================== TIMESTAMPS ====================

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  // ==================== RELACIONES ====================
  // Comentadas porque usamos raw SQL queries, no repositorios TypeORM

  // @OneToOne(() => Company)
  // @JoinColumn({ name: 'id_company' })
  // company: Company;
}
