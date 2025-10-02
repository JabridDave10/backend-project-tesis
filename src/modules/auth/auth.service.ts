import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CredentialsService } from '../users/credentials.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private credentialsService: CredentialsService,
    private jwtService: JwtService
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string; user: any }> {
    const credentials = await this.credentialsService.findByUsername(username);
    if (!credentials) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    const isPasswordValid = await bcrypt.compare(pass, credentials.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Obtener los datos del usuario
    const user = await this.usersService.findOne(credentials.id_user);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    const payload = { 
      sub: user.id_user,  // sub = id_user como pediste
      username: credentials.username,
      email: user.email,
      role: user.id_role 
    };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id_user,
        username: credentials.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };
  }
}
