import { IsNotEmpty, IsString, IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({ description: 'ID del usuario asociado' })
  @IsNotEmpty()
  @IsInt()
  id_user: number;

  @ApiProperty({ description: 'Número de licencia de conducir' })
  @IsNotEmpty()
  @IsString()
  license_number: string;

  @ApiProperty({ description: 'Tipo de licencia (A, B, C, D, E)' })
  @IsNotEmpty()
  @IsString()
  license_type: string;

  @ApiProperty({ description: 'Fecha de vencimiento de la licencia' })
  @IsNotEmpty()
  @IsDateString()
  license_expiry_date: string;

  @ApiProperty({ description: 'URL de la foto de la licencia', required: false })
  @IsOptional()
  @IsString()
  license_photo?: string;

  @ApiProperty({ description: 'Años de experiencia', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  years_experience?: number;

  @ApiProperty({ description: 'Estado del conductor', required: false, default: 'disponible' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
