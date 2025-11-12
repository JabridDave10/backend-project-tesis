import { IsNotEmpty, IsString, IsInt, IsOptional, IsDateString, IsEnum, IsArray, ArrayMinSize, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LicenseCategory, BloodType } from '../enums/driver.enums';

export class CreateDriverDto {
  @ApiProperty({ description: 'ID del usuario asociado' })
  @IsNotEmpty()
  @IsInt()
  id_user: number;

  // ==================== INFORMACIÓN DE LICENCIA ====================

  @ApiProperty({
    description: 'Número de licencia de conducir (mismo que la cédula, 4-10 dígitos)',
    example: '1234567890'
  })
  @IsNotEmpty()
  @IsString()
  @Length(4, 10)
  @Matches(/^[0-9]+$/, { message: 'El número de licencia solo debe contener dígitos' })
  license_number: string;

  @ApiProperty({
    description: 'Categorías de licencia (puede tener múltiples)',
    enum: LicenseCategory,
    isArray: true,
    example: ['A2', 'B1']
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una categoría de licencia' })
  @IsEnum(LicenseCategory, { each: true })
  license_categories: LicenseCategory[];

  @ApiProperty({
    description: 'Fecha de expedición de la licencia',
    example: '2020-01-15'
  })
  @IsNotEmpty()
  @IsDateString()
  license_issue_date: string;

  @ApiProperty({
    description: 'Fecha de vencimiento de la licencia',
    example: '2030-01-15'
  })
  @IsNotEmpty()
  @IsDateString()
  license_expiry_date: string;

  @ApiProperty({
    description: 'Organismo de tránsito que expidió la licencia',
    example: 'Secretaría de Movilidad de Bogotá'
  })
  @IsNotEmpty()
  @IsString()
  license_issuing_authority: string;

  @ApiProperty({
    description: 'URL de la foto de la licencia (se sube después)',
    required: false
  })
  @IsOptional()
  @IsString()
  license_photo?: string;

  // ==================== INFORMACIÓN MÉDICA ====================

  @ApiProperty({
    description: 'Grupo sanguíneo del conductor',
    enum: BloodType,
    example: 'O+'
  })
  @IsNotEmpty()
  @IsEnum(BloodType)
  blood_type: BloodType;

  @ApiProperty({
    description: 'Fecha de expedición del certificado médico',
    example: '2024-01-15'
  })
  @IsNotEmpty()
  @IsDateString()
  medical_certificate_date: string;

  @ApiProperty({
    description: 'Fecha de vencimiento del certificado médico',
    example: '2025-01-15'
  })
  @IsNotEmpty()
  @IsDateString()
  medical_certificate_expiry: string;

  @ApiProperty({
    description: 'Restricciones médicas (ej: uso de lentes)',
    required: false,
    example: 'Uso de lentes correctivos'
  })
  @IsOptional()
  @IsString()
  medical_restrictions?: string;

  // ==================== CONTACTO DE EMERGENCIA ====================

  @ApiProperty({
    description: 'Nombre completo del contacto de emergencia',
    example: 'María Pérez'
  })
  @IsNotEmpty()
  @IsString()
  emergency_contact_name: string;

  @ApiProperty({
    description: 'Parentesco del contacto de emergencia',
    example: 'Esposa'
  })
  @IsNotEmpty()
  @IsString()
  emergency_contact_relationship: string;

  @ApiProperty({
    description: 'Teléfono del contacto de emergencia',
    example: '3001234567'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'El teléfono debe tener 10 dígitos' })
  emergency_contact_phone: string;

  // ==================== OTROS DATOS ====================

  @ApiProperty({
    description: 'Dirección de residencia del conductor',
    required: false,
    example: 'Calle 123 #45-67, Bogotá'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Notas u observaciones adicionales',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  // NOTA: El campo 'status' NO se pide en el formulario,
  // se auto-asigna como 'disponible' en el service
}
