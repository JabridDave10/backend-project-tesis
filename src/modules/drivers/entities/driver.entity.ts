import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DriverWorkExperience } from './driver-work-experience.entity';
import { DriverCertification } from './driver-certification.entity';
import { BloodType, LicenseCategory } from '../enums/driver.enums';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id_driver: number;

  @Column('int')
  id_user: number;

  // ==================== INFORMACIÓN DE LICENCIA ====================

  @Column('text')
  license_number: string;

  @Column('simple-array', { nullable: true })
  license_categories: LicenseCategory[]; // Múltiples categorías: ["A2", "B1", "C1"]

  @Column('date')
  license_issue_date: Date; // Fecha de expedición

  @Column('date')
  license_expiry_date: Date; // Fecha de vencimiento

  @Column('text')
  license_issuing_authority: string; // Organismo emisor (ej: Sec. Movilidad Bogotá)

  @Column('text', { nullable: true })
  license_photo: string; // URL de la foto de la licencia

  // ==================== INFORMACIÓN MÉDICA ====================

  @Column({
    type: 'enum',
    enum: BloodType,
  })
  blood_type: BloodType; // Grupo sanguíneo (obligatorio por ley)

  @Column('date')
  medical_certificate_date: Date; // Fecha de expedición del certificado médico

  @Column('date')
  medical_certificate_expiry: Date; // Vencimiento del certificado médico

  @Column('text', { nullable: true })
  medical_restrictions: string; // Restricciones médicas (ej: "Uso de lentes correctivos")

  // ==================== CONTACTO DE EMERGENCIA ====================

  @Column('text')
  emergency_contact_name: string; // Nombre completo del contacto

  @Column('text')
  emergency_contact_relationship: string; // Parentesco (ej: Esposa, Madre, Hermano)

  @Column('text')
  emergency_contact_phone: string; // Teléfono del contacto

  // ==================== OTROS DATOS ====================

  @Column('text', { nullable: true })
  address: string; // Dirección de residencia

  @Column('text', { default: 'disponible' })
  status: string; // Estado operacional (disponible, en_ruta, descanso, inactivo)
  // NOTA: Este campo se auto-asigna como "disponible" al crear, no se pide en el formulario

  @Column('text', { nullable: true })
  notes: string; // Notas u observaciones adicionales

  // ==================== TIMESTAMPS ====================

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  modified_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date;

  // ==================== RELACIONES ====================

  // Relación con User
  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  // Relación con Experiencias Laborales
  @OneToMany(() => DriverWorkExperience, experience => experience.driver)
  workExperiences: DriverWorkExperience[];

  // Relación con Certificaciones
  @OneToMany(() => DriverCertification, certification => certification.driver)
  certifications: DriverCertification[];
}
