import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';

@Entity('user_role')
export class UserRole {
  @PrimaryGeneratedColumn()
  id_user_role: number;

  @Column('int8')
  id_user: number; 

  @Column('int8')
  id_role: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // Relaciones
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'id_role' })
  role: Role;
}
