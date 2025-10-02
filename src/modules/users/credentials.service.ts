import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Credentials } from './entities/credentials.entity';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(credentialsData: Partial<Credentials>): Promise<Credentials> {
    try {
      const query = `
        INSERT INTO credentials (id_user, username, password)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const values = [
        credentialsData.id_user,
        credentialsData.username,
        credentialsData.password
      ];
      
      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al crear credenciales:', error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<Credentials | undefined> {
    try {
      const query = `
        SELECT * FROM credentials 
        WHERE username = $1
      `;
      const result = await this.dataSource.query(query, [username]);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error al buscar credenciales por username:', error);
      return undefined;
    }
  }

  async findByUserId(id_user: number): Promise<Credentials | undefined> {
    return await this.dataSource
      .createQueryBuilder()
      .select('credentials.*')
      .from(Credentials, 'credentials')
      .where('credentials.id_user = :id_user', { id_user })
      .getRawOne();
  }

  async updatePassword(id_user: number, newPassword: string): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(Credentials)
      .set({ password: newPassword })
      .where('id_user = :id_user', { id_user })
      .execute();
  }

  async remove(id_user: number): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Credentials)
      .where('id_user = :id_user', { id_user })
      .execute();
  }
}
