import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id_vehicle: number;

  @Column('text', { unique: true })
  license_plate: string; // Matrícula/Placa

  @Column('text')
  vehicle_type: string; // moto, carro, furgoneta, camion, camion_articulado

  @Column('text')
  brand: string; // Marca

  @Column('text')
  model: string; // Modelo

  @Column('int')
  year: number; // Año de fabricación

  @Column('decimal', { precision: 10, scale: 2 })
  weight_capacity: number; // Capacidad de peso en kg

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  volume_capacity: number; // Capacidad volumétrica en m³

  @Column('text', { default: 'activo' })
  status: string; // activo, en_mantenimiento, inactivo

  @Column('date', { nullable: true })
  insurance_expiry: Date; // Vencimiento del seguro/SOAT

  @Column('date', { nullable: true })
  technical_review_expiry: Date; // Vencimiento de revisión técnica

  @Column('int', { default: 0 })
  current_mileage: number; // Kilometraje actual

  @Column('int', { nullable: true })
  id_driver: number; // Conductor asignado

  @Column('text', { nullable: true })
  photo: string; // Foto del vehículo

  @Column('text', { nullable: true })
  notes: string; // Observaciones

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // Relación con Driver
  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'id_driver' })
  driver: Driver;
}
