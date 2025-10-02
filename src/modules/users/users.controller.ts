import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario con credenciales' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuario registrado exitosamente' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            first_name: { type: 'string', example: 'Juan' },
            last_name: { type: 'string', example: 'Pérez' },
            identification: { type: 'string', example: '12345678' },
            birthdate: { type: 'string', example: '1990-05-15' },
            email: { type: 'string', example: 'juan@example.com' },
            phone: { type: 'string', example: '1234567890' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Error al registrar usuario' })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerDto: RegisterUserDto) {
    try {
      const result = await this.usersService.registerUser(registerDto);
      return {
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
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error al registrar usuario',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
