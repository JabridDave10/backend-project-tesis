
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async createRole(roleData: CreateRoleDto): Promise<Role> {
    try {
      const query = `
        INSERT INTO roles (role_name, description)
        VALUES ($1, $2)
        RETURNING *
      `;
      const result = await this.dataSource.query(query, [roleData.role_name, roleData.description]);
      return result[0];
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  } 
}
