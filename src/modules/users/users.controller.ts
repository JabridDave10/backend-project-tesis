import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Ip, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import type { Request } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { FileValidationService } from '../../common/services/file-validation.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileValidationService: FileValidationService,
  ) {}

  @Post('register')
  async register(
    @Body() body: RegisterUserDto,
    @Ip() ip: string,
    @Req() request: Request,
  ) {
    console.log('Register request received:', { body, ip, userAgent: request.headers['user-agent'] });
    
    // Validar datos usando class-validator
    const registerUser = plainToClass(RegisterUserDto, body);
    const validationErrors = await validate(registerUser);

    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      // Formatear errores de validación para una respuesta más clara
      const formattedErrors = validationErrors.map(error => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value
      }));
      
      throw new BadRequestException({
        message: 'Error de validación',
        errors: formattedErrors
      });
    }

    const result = await this.usersService.registerUser(body);
    console.log('User registered successfully:', result.user.id_user);

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
  }

  @Post(':id/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir foto de perfil del usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (jpg, jpeg, png) - Máximo 5MB',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto subida exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Delegar validación al FileValidationService (solo imágenes, sin PDF)
    this.fileValidationService.validateImageFile(file, 5);

    try {
      const result = await this.usersService.uploadPhoto(+id, file);
      return {
        message: 'Foto de perfil subida exitosamente',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }
}
