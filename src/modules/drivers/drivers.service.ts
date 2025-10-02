import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    try {
      const query = `
        INSERT INTO drivers (
          id_user, license_number, license_type, license_expiry_date,
          license_photo, years_experience, status, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        createDriverDto.id_user,
        createDriverDto.license_number,
        createDriverDto.license_type,
        createDriverDto.license_expiry_date,
        createDriverDto.license_photo || null,
        createDriverDto.years_experience || 0,
        createDriverDto.status || 'disponible',
        createDriverDto.notes || null,
      ];

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al crear conductor:', error);
      throw error;
    }
  }

  async findAll(): Promise<Driver[]> {
    try {
      const query = `
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone
        FROM drivers d
        INNER JOIN users u ON d.id_user = u.id_user
        WHERE d.deleted_at IS NULL
        ORDER BY d.created_at DESC
      `;
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Error al buscar conductores:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<Driver> {
    try {
      const query = `
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone
        FROM drivers d
        INNER JOIN users u ON d.id_user = u.id_user
        WHERE d.id_driver = $1 AND d.deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [id]);

      if (!result[0]) {
        throw new NotFoundException(`Conductor con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      console.error('Error al buscar conductor:', error);
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<Driver | null> {
    try {
      const query = `
        SELECT * FROM drivers
        WHERE id_user = $1 AND deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [userId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error al buscar conductor por user ID:', error);
      return null;
    }
  }

  async update(id: number, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    try {
      // Verificar que el conductor existe
      await this.findOne(id);

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateDriverDto.license_number !== undefined) {
        updateFields.push(`license_number = $${paramIndex++}`);
        values.push(updateDriverDto.license_number);
      }
      if (updateDriverDto.license_type !== undefined) {
        updateFields.push(`license_type = $${paramIndex++}`);
        values.push(updateDriverDto.license_type);
      }
      if (updateDriverDto.license_expiry_date !== undefined) {
        updateFields.push(`license_expiry_date = $${paramIndex++}`);
        values.push(updateDriverDto.license_expiry_date);
      }
      if (updateDriverDto.license_photo !== undefined) {
        updateFields.push(`license_photo = $${paramIndex++}`);
        values.push(updateDriverDto.license_photo);
      }
      if (updateDriverDto.years_experience !== undefined) {
        updateFields.push(`years_experience = $${paramIndex++}`);
        values.push(updateDriverDto.years_experience);
      }
      if (updateDriverDto.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(updateDriverDto.status);
      }
      if (updateDriverDto.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        values.push(updateDriverDto.notes);
      }

      updateFields.push(`modified_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE drivers
        SET ${updateFields.join(', ')}
        WHERE id_driver = $${paramIndex}
        RETURNING *
      `;

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);

      const query = `
        UPDATE drivers
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id_driver = $1
      `;
      await this.dataSource.query(query, [id]);
    } catch (error) {
      console.error('Error al eliminar conductor:', error);
      throw error;
    }
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    try {
      const query = `
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone
        FROM drivers d
        INNER JOIN users u ON d.id_user = u.id_user
        WHERE d.status = 'disponible' AND d.deleted_at IS NULL
        ORDER BY d.years_experience DESC
      `;
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Error al buscar conductores disponibles:', error);
      return [];
    }
  }
}
