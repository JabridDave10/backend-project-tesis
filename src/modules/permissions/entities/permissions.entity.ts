import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
 
@Entity('permissions')
export class Permissions{
    @PrimaryGeneratedColumn()
    id_permission: number;
 
    @Column('text')
    name: string;
 
    @CreateDateColumn()
    created_at: Date;
 
    @UpdateDateColumn()
    modified_at: Date;
 
    @Column('timestamp', { nullable: true })
    deleted_at: Date;
}