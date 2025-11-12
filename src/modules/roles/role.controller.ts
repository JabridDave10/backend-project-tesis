import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Ip, Req, Res, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AuthGuard } from '../auth/auth.guard';


@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  
  @Post('create')
  async createRole(@Body() body: any, @Ip() ip: string, @Req() request: Request, @Res() response: Response) {
    try {
      const role = await this.roleService.createRole(body);
      return {
        message: 'Rol creado exitosamente',
        data: role
      };
    } catch (error) {
      throw error;
    }
  }
}
