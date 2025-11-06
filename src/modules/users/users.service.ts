import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { CredentialsService } from '../credentials/credentials.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private credentialsService: CredentialsService,
  ) {}

  private async createUser(userData: any): Promise<User> {
    console.log('Datos del usuario a insertar:', userData);
    
    try {
      // Usar query SQL directa para evitar problemas con createQueryBuilder
      const query = `
        INSERT INTO users (first_name, last_name, identification, birthdate, email, phone, photo, id_role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        userData.first_name,
        userData.last_name,
        userData.identification,
        userData.birthdate,
        userData.email,
        userData.phone,
        userData.photo || '',
        userData.id_role
      ];
      
      const result = await this.dataSource.query(query, values);
      console.log('Usuario creado exitosamente:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  async registerUser(registerDto: RegisterUserDto): Promise<{ user: User; credentials: any }> {
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Verificar si el username ya existe
    const existingCredentials = await this.credentialsService.findByUsername(registerDto.email);
    if (existingCredentials) {
      throw new Error('El email ya está registrado como username');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear el usuario
    const userData = {
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      identification: registerDto.identification,
      birthdate: registerDto.birthdate,
      email: registerDto.email,
      phone: registerDto.phone,
      photo: registerDto.photo || '',
      id_role: registerDto.id_role || 1
    };

    const user = await this.createUser(userData);

    // Crear las credenciales
    const credentialsData = {
      id_user: user.id_user,
      username: registerDto.email,
      password: hashedPassword
    };

    const credentials = await this.credentialsService.create(credentialsData);

    return { user, credentials };
  }

  async findAll(): Promise<User[]> {
    try {
      const query = `
        SELECT * FROM users
        WHERE deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query);
      return result;
    } catch (error) {
      console.error('Error al buscar todos los usuarios:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<User | undefined> {
    try {
      const query = `
        SELECT * FROM users
        WHERE id_user = $1 AND deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [id]);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      return undefined;
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE email = $1 AND deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [email]);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      return undefined;
    }
  }

  // async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
  //   await this.dataSource
  //     .createQueryBuilder()
  //     .update(User)
  //     .set({ ...updateUserDto, modified_at: new Date() })
  //     .where('id_user = :id', { id })
  //     .execute();
    
  //   return await this.findOne(id);
  // }

  // async remove(id: number): Promise<void> {
  //   // Soft delete - marcar como eliminado en lugar de borrar físicamente
  //   await this.dataSource
  //     .createQueryBuilder()
  //     .update(User)
  //     .set({ 
  //       deleted_at: new Date(),
  //       estsis: 0 
  //     })
  //     .where('id_user = :id', { id })
  //     .execute();
  // }

}
