import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    identification: string;
    
    @IsString()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @IsNotEmpty()
    phone: string;
    
    
    @IsString()
    @IsNotEmpty()
    address: string;
}