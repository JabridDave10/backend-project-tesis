import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Permissions } from './permissions.entity';

@Entity('role_permissions')
export class RolePermissions {
    @PrimaryGeneratedColumn()
    id_role_permissions: number;

    @Column('int8')
    id_role: number;

    @Column('int8')
    id_permission: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    modified_at: Date;

    @Column('timestamp', { nullable: true })
    deleted_at: Date;

    // Relaciones
    @ManyToOne(() => Role, { nullable: true })
    @JoinColumn({ name: 'id_role' })
    role: Role;

    @ManyToOne(() => Permissions, { nullable: true })
    @JoinColumn({ name: 'id_permission' })
    permission: Permissions;
}