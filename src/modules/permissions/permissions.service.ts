import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Permissions } from './entities/permissions.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(permissionsData: Partial<Permissions>): Promise<Permissions> {
    try {
      const query = `
        INSERT INTO permissions (name)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await this.dataSource.query(query, [permissionsData.name]);
      return result[0];
    } catch (error) {
      console.error('Error al crear credenciales:', error);
      throw error;
    }
  }
}
