import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    nit: string;

    @IsString()
    @IsOptional()
    logo: string;  
}