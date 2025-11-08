import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('company')
export class Company {
    @PrimaryGeneratedColumn()
    id_company: number;

    @Column('text')
    name: string;

    @Column('text')
    nit: string;

    @Column('text')
    logo: string;

    @Column('int8')
    id_status: number;

    @Column('timestamp')
    created_at: Date;

    @UpdateDateColumn('timestamp')
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;
}