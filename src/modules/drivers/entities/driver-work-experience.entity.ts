import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from './driver.entity';
import { VehicleType, CargoType } from '../enums/driver.enums';

@Entity('driver_work_experiences')
export class DriverWorkExperience {
  @PrimaryGeneratedColumn()
  id_experience: number;

  @Column('int')
  id_driver: number;

  @Column('text')
  company_name: string;

  @Column('text')
  position: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    nullable: true,
  })
  vehicle_type: VehicleType;

  @Column({
    type: 'enum',
    enum: CargoType,
    nullable: true,
  })
  cargo_type: CargoType;

  @Column('date')
  start_date: Date;

  @Column('date', { nullable: true })
  end_date: Date;

  @Column('text', { nullable: true })
  reason_for_leaving: string;

  @Column('text', { nullable: true })
  reference_name: string;

  @Column('text', { nullable: true })
  reference_phone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  // Relación con Driver
  @ManyToOne(() => Driver, driver => driver.workExperiences)
  @JoinColumn({ name: 'id_driver' })
  driver: Driver;
}
