import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Credentials } from '../../credentials/entities/credentials.entity';
import { UserRole } from 'src/modules/roles/entities/user_role';
 
@Entity('users')
export class User{
    @PrimaryGeneratedColumn()
    id_user: number;
 
    @Column('text')
    first_name: string;
 
    @Column('text')
    last_name: string;

    @Column('text')
    identification: string;
   
    @Column('date')
    birthdate: string;
   
    @Column('text', { nullable: true })
    photo: string;
 
    @CreateDateColumn()
    created_at: Date;
 
    @UpdateDateColumn()
    modified_at: Date;
 
    @Column('timestamp', { nullable: true })
    deleted_at: Date;
 
    @Column('int8')
    id_role: number;
 
    @Column('text', { unique: true })
    email: string;
 
    @Column('text')
    phone: string;

    // Relación con Credentials
    @OneToOne(() => Credentials, credentials => credentials.user)
    credentials: Credentials;

    // Relación con Role
    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles: UserRole[];
}