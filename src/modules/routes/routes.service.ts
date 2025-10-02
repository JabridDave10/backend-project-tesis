import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    try {
      const query = `
        INSERT INTO routes (
          route_code, id_driver, id_vehicle, origin_address, origin_latitude, origin_longitude,
          destination_address, destination_latitude, destination_longitude, cargo_weight,
          cargo_volume, cargo_description, status, estimated_distance, estimated_duration,
          estimated_cost, scheduled_date, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;

      const values = [
        createRouteDto.route_code,
        createRouteDto.id_driver || null,
        createRouteDto.id_vehicle || null,
        createRouteDto.origin_address,
        createRouteDto.origin_latitude || null,
        createRouteDto.origin_longitude || null,
        createRouteDto.destination_address,
        createRouteDto.destination_latitude || null,
        createRouteDto.destination_longitude || null,
        createRouteDto.cargo_weight,
        createRouteDto.cargo_volume || null,
        createRouteDto.cargo_description || null,
        createRouteDto.status || 'pendiente',
        createRouteDto.estimated_distance || null,
        createRouteDto.estimated_duration || null,
        createRouteDto.estimated_cost || null,
        createRouteDto.scheduled_date || null,
        createRouteDto.notes || null,
      ];

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al crear ruta:', error);
      throw error;
    }
  }

  async findAll(): Promise<Route[]> {
    try {
      const query = `
        SELECT r.*,
               d.license_number as driver_license,
               u.first_name as driver_first_name,
               u.last_name as driver_last_name,
               v.license_plate as vehicle_plate,
               v.vehicle_type, v.brand as vehicle_brand, v.model as vehicle_model
        FROM routes r
        LEFT JOIN drivers d ON r.id_driver = d.id_driver
        LEFT JOIN users u ON d.id_user = u.id_user
        LEFT JOIN vehicles v ON r.id_vehicle = v.id_vehicle
        WHERE r.deleted_at IS NULL
        ORDER BY r.created_at DESC
      `;
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Error al buscar rutas:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<Route> {
    try {
      const query = `
        SELECT r.*,
               d.license_number as driver_license,
               u.first_name as driver_first_name,
               u.last_name as driver_last_name,
               u.phone as driver_phone,
               v.license_plate as vehicle_plate,
               v.vehicle_type, v.brand as vehicle_brand, v.model as vehicle_model
        FROM routes r
        LEFT JOIN drivers d ON r.id_driver = d.id_driver
        LEFT JOIN users u ON d.id_user = u.id_user
        LEFT JOIN vehicles v ON r.id_vehicle = v.id_vehicle
        WHERE r.id_route = $1 AND r.deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [id]);

      if (!result[0]) {
        throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
      }

      return result[0];
    } catch (error) {
      console.error('Error al buscar ruta:', error);
      throw error;
    }
  }

  async update(id: number, updateRouteDto: UpdateRouteDto): Promise<Route> {
    try {
      await this.findOne(id);

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.keys(updateRouteDto).forEach((key) => {
        if (updateRouteDto[key as keyof UpdateRouteDto] !== undefined) {
          updateFields.push(`${key} = $${paramIndex++}`);
          values.push(updateRouteDto[key as keyof UpdateRouteDto]);
        }
      });

      updateFields.push(`modified_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE routes
        SET ${updateFields.join(', ')}
        WHERE id_route = $${paramIndex}
        RETURNING *
      `;

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al actualizar ruta:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);

      const query = `
        UPDATE routes
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id_route = $1
      `;
      await this.dataSource.query(query, [id]);
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
      throw error;
    }
  }

  async getRoutesByStatus(status: string): Promise<Route[]> {
    try {
      const query = `
        SELECT r.*,
               d.license_number as driver_license,
               u.first_name as driver_first_name,
               u.last_name as driver_last_name,
               v.license_plate as vehicle_plate
        FROM routes r
        LEFT JOIN drivers d ON r.id_driver = d.id_driver
        LEFT JOIN users u ON d.id_user = u.id_user
        LEFT JOIN vehicles v ON r.id_vehicle = v.id_vehicle
        WHERE r.status = $1 AND r.deleted_at IS NULL
        ORDER BY r.scheduled_date ASC
      `;
      return await this.dataSource.query(query, [status]);
    } catch (error) {
      console.error('Error al buscar rutas por estado:', error);
      return [];
    }
  }

  async updateStatus(id: number, status: string, completedAt?: Date): Promise<Route> {
    try {
      const updates: any = { status };

      if (status === 'en_progreso' && !completedAt) {
        updates.started_at = new Date();
      }

      if (status === 'completada') {
        updates.completed_at = completedAt || new Date();
      }

      return await this.update(id, updates);
    } catch (error) {
      console.error('Error al actualizar estado de ruta:', error);
      throw error;
    }
  }
}
