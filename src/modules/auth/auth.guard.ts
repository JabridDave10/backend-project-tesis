
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
      
      // Intentar primero el header Authorization (intencion explicita del cliente,
      // funciona en cross-origin sin depender de cookies de terceros)
      let token = this.extractTokenFromHeader(request);

      // Fallback a cookies httpOnly (same-origin / sesiones del navegador)
      if (!token) {
        token = this.extractTokenFromCookies(request);
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
  