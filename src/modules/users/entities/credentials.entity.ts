import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('credentials')
export class Credentials {
  @PrimaryGeneratedColumn()
  id_credentials: number;

  @Column('int8', { unique: true })
  id_user: number;

  @Column('text', { unique: true })
  username: string;

  @Column('text')
  password: string;

  // Relación con User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;
}
