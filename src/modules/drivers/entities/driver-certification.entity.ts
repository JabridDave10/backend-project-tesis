import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from './driver.entity';
import { CertificationType } from '../enums/driver.enums';

@Entity('driver_certifications')
export class DriverCertification {
  @PrimaryGeneratedColumn()
  id_certification: number;

  @Column('int')
  id_driver: number;

  @Column({
    type: 'enum',
    enum: CertificationType,
  })
  certification_type: CertificationType;

  @Column('text')
  certification_name: string;

  @Column('text')
  issuing_institution: string;

  @Column('date')
  issue_date: Date;

  @Column('date', { nullable: true })
  expiry_date: Date;

  @Column('text', { nullable: true })
  certificate_file: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  // Relación con Driver
  @ManyToOne(() => Driver, driver => driver.certifications)
  @JoinColumn({ name: 'id_driver' })
  driver: Driver;
}
