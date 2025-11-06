import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Ip, Req, Res } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';


@ApiTags('Credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}


  @Post('update')
  async updatePassword(@Body() body: any) {
    try {
      const password = await this.credentialsService.updatePassword(body.id_user, body.password);
      return {
        message: 'Contraseña actualizada exitosamente',
        data: password
      };
    } catch (error) {
      throw error;
    }
  }
}
