import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('company_user')
export class CompanyUser {
    @PrimaryGeneratedColumn()
    id_company_user: number;

    @Column('int8')
    id_company: number;

    @Column('int8')
    id_user: number;

    @Column('int8')
    id_status: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;

    // Relaciones
    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: 'id_company' })
    company: Company;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'id_user' })
    user: User;
}