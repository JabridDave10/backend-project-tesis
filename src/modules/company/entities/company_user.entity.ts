import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('company')
export class Company {
    @PrimaryGeneratedColumn()
    id_company_user: number;

    @Column('int8')
    id_company: number;

    @Column('int8')
    id_user: number;

    @Column('int8')
    id_status: number;

    @Column('timestamp')
    created_at: Date;

    @UpdateDateColumn('timestamp')
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;
}