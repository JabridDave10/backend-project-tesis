import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  first_name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  last_name: string;

  @ApiProperty({
    description: 'Número de identificación',
    example: '12345678',
    minLength: 1,
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  identification: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
    format: 'date'
  })
  @IsDateString()
  @IsNotEmpty()
  birthdate: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan@example.com',
    format: 'email'
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '1234567890',
    minLength: 1,
    maxLength: 11
  })
  @IsString()
  @MinLength(1)
  @MaxLength(11)
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'miPassword123',
    minLength: 6,
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    description: 'ID del rol del usuario',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  id_role?: number;

  @ApiProperty({
    description: 'URL de la foto del usuario',
    example: '',
    required: false
  })
  @IsString()
  @IsOptional()
  photo?: string;
}
