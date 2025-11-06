import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Ip, Req, Res } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';


@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  
  @Post('create')
  async createRole(@Body() body: any) {
    try {
      const permission = await this.permissionsService.create(body);
      return {
        message: 'Permiso creado exitosamente',
        data: permission
      };
    } catch (error) {
      throw error;
    }
  }
}
