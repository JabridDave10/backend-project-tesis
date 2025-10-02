import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    try {
      const query = `
        INSERT INTO vehicles (
          license_plate, vehicle_type, brand, model, year,
          weight_capacity, volume_capacity, status, insurance_expiry,
          technical_review_expiry, current_mileage, id_driver, photo, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const values = [
        createVehicleDto.license_plate,
        createVehicleDto.vehicle_type,
        createVehicleDto.brand,
        createVehicleDto.model,
        createVehicleDto.year,
        createVehicleDto.weight_capacity,
        createVehicleDto.volume_capacity || null,
        createVehicleDto.status || 'activo',
        createVehicleDto.insurance_expiry || null,
        createVehicleDto.technical_review_expiry || null,
        createVehicleDto.current_mileage || 0,
        createVehicleDto.id_driver || null,
        createVehicleDto.photo || null,
        createVehicleDto.notes || null,
      ];

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      throw error;
    }
  }

  async findAll(): Promise<Vehicle[]> {
    try {
      const query = `
        SELECT v.*,
               d.license_number as driver_license,
               u.first_name as driver_first_name,
               u.last_name as driver_last_name
        FROM vehicles v
        LEFT JOIN drivers d ON v.id_driver = d.id_driver
        LEFT JOIN users u ON d.id_user = u.id_user
        WHERE v.deleted_at IS NULL
        ORDER BY v.created_at DESC
      `;
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Error al buscar vehículos:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<Vehicle> {
    try {
      const query = `
        SELECT v.*,
               d.license_number as driver_license,
               u.first_name as driver_first_name,
               u.last_name as driver_last_name,
               u.phone as driver_phone
        FROM vehicles v
        LEFT JOIN drivers d ON v.id_driver = d.id_driver
        LEFT JOIN users u ON d.id_user = u.id_user
        WHERE v.id_vehicle = $1 AND v.deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [id]);

      if (!result[0]) {
        throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      console.error('Error al buscar vehículo:', error);
      throw error;
    }
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    try {
      // Verificar que el vehículo existe
      await this.findOne(id);

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateVehicleDto.license_plate !== undefined) {
        updateFields.push(`license_plate = $${paramIndex++}`);
        values.push(updateVehicleDto.license_plate);
      }
      if (updateVehicleDto.vehicle_type !== undefined) {
        updateFields.push(`vehicle_type = $${paramIndex++}`);
        values.push(updateVehicleDto.vehicle_type);
      }
      if (updateVehicleDto.brand !== undefined) {
        updateFields.push(`brand = $${paramIndex++}`);
        values.push(updateVehicleDto.brand);
      }
      if (updateVehicleDto.model !== undefined) {
        updateFields.push(`model = $${paramIndex++}`);
        values.push(updateVehicleDto.model);
      }
      if (updateVehicleDto.year !== undefined) {
        updateFields.push(`year = $${paramIndex++}`);
        values.push(updateVehicleDto.year);
      }
      if (updateVehicleDto.weight_capacity !== undefined) {
        updateFields.push(`weight_capacity = $${paramIndex++}`);
        values.push(updateVehicleDto.weight_capacity);
      }
      if (updateVehicleDto.volume_capacity !== undefined) {
        updateFields.push(`volume_capacity = $${paramIndex++}`);
        values.push(updateVehicleDto.volume_capacity);
      }
      if (updateVehicleDto.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(updateVehicleDto.status);
      }
      if (updateVehicleDto.insurance_expiry !== undefined) {
        updateFields.push(`insurance_expiry = $${paramIndex++}`);
        values.push(updateVehicleDto.insurance_expiry);
      }
      if (updateVehicleDto.technical_review_expiry !== undefined) {
        updateFields.push(`technical_review_expiry = $${paramIndex++}`);
        values.push(updateVehicleDto.technical_review_expiry);
      }
      if (updateVehicleDto.current_mileage !== undefined) {
        updateFields.push(`current_mileage = $${paramIndex++}`);
        values.push(updateVehicleDto.current_mileage);
      }
      if (updateVehicleDto.id_driver !== undefined) {
        updateFields.push(`id_driver = $${paramIndex++}`);
        values.push(updateVehicleDto.id_driver);
      }
      if (updateVehicleDto.photo !== undefined) {
        updateFields.push(`photo = $${paramIndex++}`);
        values.push(updateVehicleDto.photo);
      }
      if (updateVehicleDto.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        values.push(updateVehicleDto.notes);
      }

      updateFields.push(`modified_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE vehicles
        SET ${updateFields.join(', ')}
        WHERE id_vehicle = $${paramIndex}
        RETURNING *
      `;

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);

      const query = `
        UPDATE vehicles
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id_vehicle = $1
      `;
      await this.dataSource.query(query, [id]);
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      throw error;
    }
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    try {
      const query = `
        SELECT v.*,
               d.license_number as driver_license,
               u.first_name as driver_first_name,
               u.last_name as driver_last_name
        FROM vehicles v
        LEFT JOIN drivers d ON v.id_driver = d.id_driver
        LEFT JOIN users u ON d.id_user = u.id_user
        WHERE v.status = 'activo' AND v.deleted_at IS NULL
        ORDER BY v.weight_capacity DESC
      `;
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Error al buscar vehículos disponibles:', error);
      return [];
    }
  }

  async getVehiclesByDriver(driverId: number): Promise<Vehicle[]> {
    try {
      const query = `
        SELECT * FROM vehicles
        WHERE id_driver = $1 AND deleted_at IS NULL
      `;
      return await this.dataSource.query(query, [driverId]);
    } catch (error) {
      console.error('Error al buscar vehículos por conductor:', error);
      return [];
    }
  }
}
