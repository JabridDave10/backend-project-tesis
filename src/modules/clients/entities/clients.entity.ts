import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Sales } from '../../sale/entities/sales.entity';

@Entity('clients')
export class Clients {
  @PrimaryGeneratedColumn()
  id_client: number;

  @Column('text')
  name: string;

  @Column('text')
  identification: string;

  @Column('text')
  email: string;

  @Column('text')
  phone: string;

  @Column('text')
  address: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // Relaciones
  @OneToMany(() => Sales, (sale) => sale.client)
  sales: Sales[];
}
