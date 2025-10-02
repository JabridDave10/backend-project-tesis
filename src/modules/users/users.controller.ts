import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Ip, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() body: RegisterUserDto,
    @Ip() ip: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      console.log('Register request received:', { body, ip, userAgent: request.headers['user-agent'] });
      
      // Validar datos usando class-validator
      const registerUser = plainToClass(RegisterUserDto, body);
      const resultValidated = await validate(registerUser).then((errors) => {
        if (errors.length > 0) {
          return errors;
        } else {
          return 1;
        }
      });

      if (resultValidated !== 1) {
        console.log('Validation errors:', resultValidated);
        return response.status(400).json({
          message: 'Error de validación',
          errors: resultValidated
        });
      }

      const result = await this.usersService.registerUser(body);
      console.log('User registered successfully:', result.user.id_user);

      if (result != null && result != undefined) {
        const responseData = {
          message: 'Usuario registrado exitosamente',
          user: {
            id: result.user.id_user,
            first_name: result.user.first_name,
            last_name: result.user.last_name,
            identification: result.user.identification,
            birthdate: result.user.birthdate,
            email: result.user.email,
            phone: result.user.phone
          }
        };
        
        response.status(201).json(responseData);
        return;
      } else {
        response.status(401).json({ error: 'Error al registrar usuario' });
        return;
      }
    } catch (error) {
      console.error('Error in register:', error);
      response.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}
