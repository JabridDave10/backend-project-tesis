
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { jwtConstants } from './constants';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      
      // Intentar obtener el token desde las cookies primero
      let token = this.extractTokenFromCookies(request);
      
      // Si no hay token en cookies, intentar desde el header Authorization (fallback)
      if (!token) {
        token = this.extractTokenFromHeader(request);
      }
      
      if (!token) {
        throw new UnauthorizedException('Token no encontrado en cookies ni en header');
      }
      
      try {
        const payload = await this.jwtService.verifyAsync(
          token,
          {
            secret: jwtConstants.secret
          }
        );
        request['user'] = payload;
      } catch {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      return true;
    }

    private extractTokenFromCookies(request: Request): string | undefined {
      return request.cookies?.access_token;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  