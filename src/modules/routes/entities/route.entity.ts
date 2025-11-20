import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { RouteProduct } from '../../products/entities/route-product.entity';
import { Sales } from '../../sale/entities/sales.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id_route: number;

  @Column('text')
  route_code: string; // Código único de la ruta

  @Column('int', { nullable: true })
  id_driver: number;

  @Column('int', { nullable: true })
  id_vehicle: number;

  @Column('text')
  origin_address: string; // Dirección de origen

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  origin_latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  origin_longitude: number;

  @Column('text')
  destination_address: string; // Dirección de destino

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  destination_latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  destination_longitude: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cargo_weight: number; // Peso de la carga en kg

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cargo_volume: number; // Volumen de la carga en m³

  @Column('text', { nullable: true })
  cargo_description: string; // Descripción de la carga

  @Column('text', { default: 'pendiente' })
  status: string; // pendiente, en_progreso, completada, cancelada

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimated_distance: number; // Distancia estimada en km

  @Column('int', { nullable: true })
  estimated_duration: number; // Duración estimada en minutos

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimated_cost: number; // Costo estimado

  @Column('timestamp', { nullable: true })
  scheduled_date: Date; // Fecha programada

  @Column('timestamp', { nullable: true })
  started_at: Date; // Fecha de inicio real

  @Column('timestamp', { nullable: true })
  completed_at: Date; // Fecha de finalización

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // Relaciones
  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'id_driver' })
  driver: Driver;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'id_vehicle' })
  vehicle: Vehicle;

  @OneToMany(() => RouteProduct, (routeProduct) => routeProduct.route)
  routeProducts: RouteProduct[];

  @OneToMany(() => Sales, (sale) => sale.route)
  sales: Sales[];
}
