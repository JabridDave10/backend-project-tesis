import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id_driver: number;

  @Column('int')
  id_user: number;

  @Column('text')
  license_number: string;

  @Column('text')
  license_type: string; // A, B, C, D, E, etc.

  @Column('date')
  license_expiry_date: Date;

  @Column('text', { nullable: true })
  license_photo: string;

  @Column('int', { default: 0 })
  years_experience: number;

  @Column('text', { default: 'disponible' })
  status: string; // disponible, en_ruta, descanso, inactivo

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // Relación con User
  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;
}
