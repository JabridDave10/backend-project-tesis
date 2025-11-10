import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Ip,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import type { Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({ type: SignInDto })
  async signIn(
    @Body() body: SignInDto,
    @Ip() ip: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      console.log('Login request received:', { email: body.email, ip, userAgent: request.headers['user-agent'] });
      
      // Validar datos usando class-validator
      const signInData = plainToClass(SignInDto, body);
      const resultValidated = await validate(signInData).then((errors) => {
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

      const result = await this.authService.signIn(body.email, body.password);
      console.log('User logged in successfully:', result.user.id);

      if (result != null && result != undefined) {
        // Configurar cookie httpOnly para el JWT
        const cookieOptions: any = {
          httpOnly: true,        // No accesible desde JavaScript del cliente
          secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Para CORS
          maxAge: 24 * 60 * 60 * 1000, // 24 horas (como está configurado en JWT)
          path: '/',             // Disponible en toda la aplicación
        };
        
        console.log('Setting cookie with options:', cookieOptions);
        console.log('Token length:', result.access_token?.length);
        console.log('Origin:', request.headers['origin'] || request.headers['referer']);
        
        response.cookie('access_token', result.access_token, cookieOptions);

        // Retornar solo los datos del usuario (el token está en la cookie)
        response.status(200).json({
          user: result.user,
          message: 'Login exitoso. Token guardado en cookie httpOnly.'
        });
        return;
      } else {
        response.status(401).json({ error: 'Error al iniciar sesión' });
        return;
      }
    } catch (error) {
      console.error('Error in signIn:', error);
      
      // Manejar diferentes tipos de errores
      if (error instanceof UnauthorizedException) {
        response.status(401).json({ 
          error: 'Credenciales inválidas',
          message: error.message 
        });
        return;
      }
      
      response.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async logout(
    @Ip() ip: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      console.log('Logout request received:', { ip, userAgent: request.headers['user-agent'] });
      
      // Limpiar la cookie del token
      response.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      response.status(200).json({
        message: 'Logout exitoso. Cookie eliminada.'
      });
      return;
    } catch (error) {
      console.error('Error in logout:', error);
      response.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async getProfile(
    @Request() req,
    @Ip() ip: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      console.log('Profile request received:', { userId: req.user.sub, ip, userAgent: request.headers['user-agent'] });
      
      if (req.user != null && req.user != undefined) {
        response.status(200).json(req.user);
        return;
      } else {
        response.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }
    } catch (error) {
      console.error('Error in getProfile:', error);
      response.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}
