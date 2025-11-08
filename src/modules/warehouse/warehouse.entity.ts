import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('warehouse')
export class Warehouse {
    @PrimaryGeneratedColumn()
    id_warehouse: number;

    @Column('text')
    address: string;

    @Column('int8')
    id_company: number;

    @Column('int8')
    id_status: number;

    @Column('timestamp')
    created_at: Date;

    @UpdateDateColumn('timestamp')
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;
}