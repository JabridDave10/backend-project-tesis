import { Controller, Post, Body, Res, UseGuards, Get } from '@nestjs/common';
import { SalesService } from './sales.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}
  
  @Post('create')
  async createSale(@Body() body: any, @Res() response: Response) {
    try {
      const saleData = plainToClass(CreateSaleDto, body);
      const errors = await validate(saleData);

      if (errors.length > 0) {
        return response.status(400).json(errors);
      }

      const result = await this.salesService.create(saleData);
      response.status(200).json({
        message: 'Venta creada exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error in createSale:', error);
      response.status(500).json({
        message: 'Error al crear venta',
        error: error.message
      });
    }
  }

  @Get('get-all')
  async getAllSales(@Res() response: Response) {
    try {
      const result = await this.salesService.getAll();
      response.status(200).json({
        message: 'Ventas obtenidas exitosamente',
        data: result
      });
    }
    catch (error) {
      console.error('Error in getAllSales:', error);
      response.status(500).json({
        message: 'Error al obtener ventas',
        error: error.message
      });
    }
  }
}
