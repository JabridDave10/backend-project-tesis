import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id_role: number;

  @Column('text')
  role_name: string; 

  @Column('text')
  description: string;
}
