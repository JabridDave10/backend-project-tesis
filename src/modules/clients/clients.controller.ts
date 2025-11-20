import { Controller, Post, Res, UseGuards, Body, Get } from '@nestjs/common';
import type { Response } from 'express';
import { ClientsService } from './clients.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post('create')
    async createClient(@Body() body: any, @Res() response: Response) {
        try {
            const clientData = plainToClass(CreateClientDto, body);
            const errors = await validate(clientData);

            if (errors.length > 0) {
                return response.status(400).json(errors);
            }

            const result = await this.clientsService.create(clientData);
            response.status(200).json({
                message: 'Cliente creado exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error in createClient:', error);
            response.status(500).json({
                message: 'Error al crear cliente',
                error: error.message
            });
        }
    }

    @Get('get-all')
    async getAllClients(@Res() response: Response) {
        try {
            const result = await this.clientsService.getAll();
            response.status(200).json({
                message: 'Clientes obtenidos exitosamente',
                data: result
            });
        } catch (error) {
            console.error('Error in getAllClients:', error);
            response.status(500).json({
                message: 'Error al obtener clientes',
                error: error.message
            });
        }
    }
}