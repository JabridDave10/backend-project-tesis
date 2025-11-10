import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Company')
@Controller('company')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  
  @Post('create')
  async createCompany(@Body() body: any, @Res() response: Response) {
    try {
      const companyData = plainToClass(CreateCompanyDto, body);
      const errors = await validate(companyData);

      if (errors.length > 0) {
        return response.status(400).json(errors);
      }

      const result = await this.companyService.create(companyData);
      response.status(200).json({
        message: 'Empresa creada exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error in createCompany:', error);
      response.status(500).json({
        message: 'Error al crear empresa',
        error: error.message
      });
    }
  }
}
