import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SendPositionDto } from './dto/send-position.dto';

@Injectable()
export class GpsTrackingService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async saveLocation(data: SendPositionDto) {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO driver_locations
          (id_driver, id_vehicle, id_route, latitude, longitude, speed, heading, accuracy, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          data.id_driver,
          data.id_vehicle || null,
          data.id_route || null,
          data.latitude,
          data.longitude,
          data.speed || null,
          data.heading || null,
          data.accuracy || null,
          data.status || 'en_ruta',
        ],
      );
      return result[0];
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  }

  async updateDriverStatus(driverId: number, status: string) {
    try {
      await this.dataSource.query(
        `UPDATE drivers SET status = $1 WHERE id_driver = $2`,
        [status, driverId],
      );
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  async getActiveDriverPositions() {
    try {
      const result = await this.dataSource.query(`
        SELECT DISTINCT ON (dl.id_driver)
          dl.id_location,
          dl.id_driver,
          dl.id_vehicle,
          dl.id_route,
          dl.latitude,
          dl.longitude,
          dl.speed,
          dl.heading,
          dl.accuracy,
          dl.status,
          dl.recorded_at,
          u.first_name,
          u.last_name,
          u.photo,
          d.license_number,
          v.license_plate,
          v.vehicle_type,
          v.brand,
          v.model,
          r.route_code,
          r.origin_address,
          r.destination_address,
          r.status as route_status
        FROM driver_locations dl
        INNER JOIN drivers d ON dl.id_driver = d.id_driver
        INNER JOIN users u ON d.id_user = u.id_user
        LEFT JOIN vehicles v ON dl.id_vehicle = v.id_vehicle
        LEFT JOIN routes r ON dl.id_route = r.id_route
        WHERE dl.recorded_at > NOW() - INTERVAL '30 minutes'
          AND d.deleted_at IS NULL
        ORDER BY dl.id_driver, dl.recorded_at DESC
      `);
      return result;
    } catch (error) {
      console.error('Error getting active driver positions:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const [[routesResult], [vehiclesResult], [driversResult], [trackingResult]] =
        await Promise.all([
          this.dataSource.query(
            `SELECT COUNT(*) as count FROM routes WHERE status = 'en_progreso' AND deleted_at IS NULL`,
          ),
          this.dataSource.query(
            `SELECT COUNT(*) as count FROM vehicles WHERE status = 'activo' AND deleted_at IS NULL`,
          ),
          this.dataSource.query(
            `SELECT COUNT(*) as count FROM drivers WHERE deleted_at IS NULL`,
          ),
          this.dataSource.query(`
            SELECT COUNT(DISTINCT id_driver) as count
            FROM driver_locations
            WHERE recorded_at > NOW() - INTERVAL '30 minutes'
          `),
        ]);

      return {
        active_routes: parseInt(routesResult.count, 10),
        active_vehicles: parseInt(vehiclesResult.count, 10),
        total_drivers: parseInt(driversResult.count, 10),
        tracking_drivers: parseInt(trackingResult.count, 10),
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getDriverByUserId(userId: number) {
    try {
      const result = await this.dataSource.query(
        `SELECT d.*, u.first_name, u.last_name, u.email, u.photo
         FROM drivers d
         INNER JOIN users u ON d.id_user = u.id_user
         WHERE d.id_user = $1 AND d.deleted_at IS NULL
         LIMIT 1`,
        [userId],
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error getting driver by user id:', error);
      throw error;
    }
  }

  async getAssignedVehicle(driverId: number) {
    try {
      const result = await this.dataSource.query(
        `SELECT id_vehicle, license_plate, vehicle_type, brand, model, year,
                weight_capacity, volume_capacity, status, current_mileage, photo
         FROM vehicles
         WHERE id_driver = $1 AND deleted_at IS NULL
         LIMIT 1`,
        [driverId],
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error getting assigned vehicle:', error);
      return null;
    }
  }

  async getActiveRouteForDriver(driverId: number) {
    try {
      const result = await this.dataSource.query(
        `SELECT r.*, v.license_plate, v.vehicle_type, v.brand, v.model
         FROM routes r
         LEFT JOIN vehicles v ON r.id_vehicle = v.id_vehicle
         WHERE r.id_driver = $1 AND r.status = 'en_progreso' AND r.deleted_at IS NULL
         ORDER BY r.scheduled_date DESC
         LIMIT 1`,
        [driverId],
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error getting active route for driver:', error);
      throw error;
    }
  }

  async getPendingRoutesForDriver(driverId: number) {
    try {
      const result = await this.dataSource.query(
        `SELECT r.*, v.license_plate, v.vehicle_type, v.brand, v.model
         FROM routes r
         LEFT JOIN vehicles v ON r.id_vehicle = v.id_vehicle
         WHERE r.id_driver = $1 AND r.status = 'pendiente' AND r.deleted_at IS NULL
         ORDER BY r.created_at DESC`,
        [driverId],
      );
      return result;
    } catch (error) {
      console.error('Error getting pending routes for driver:', error);
      return [];
    }
  }

  async startRoute(routeId: number, driverId: number) {
    try {
      // Verify the route belongs to this driver and is pendiente
      const route = await this.dataSource.query(
        `SELECT id_route, id_driver, status FROM routes
         WHERE id_route = $1 AND deleted_at IS NULL`,
        [routeId],
      );
      if (!route[0]) {
        return { success: false, message: 'Ruta no encontrada' };
      }
      if (route[0].id_driver !== driverId) {
        return { success: false, message: 'Esta ruta no esta asignada a este conductor' };
      }
      if (route[0].status !== 'pendiente') {
        return { success: false, message: `La ruta tiene estado '${route[0].status}', no se puede iniciar` };
      }

      // Update route to en_progreso
      const result = await this.dataSource.query(
        `UPDATE routes SET status = 'en_progreso', started_at = NOW(), modified_at = NOW()
         WHERE id_route = $1 RETURNING *`,
        [routeId],
      );

      // Update driver status to en_ruta
      await this.updateDriverStatus(driverId, 'en_ruta');

      return { success: true, route: result[0] };
    } catch (error) {
      console.error('Error starting route:', error);
      return { success: false, message: 'Error al iniciar la ruta' };
    }
  }

  async completeRoute(routeId: number, driverId: number) {
    try {
      const route = await this.dataSource.query(
        `SELECT id_route, id_driver, status FROM routes
         WHERE id_route = $1 AND deleted_at IS NULL`,
        [routeId],
      );
      if (!route[0]) {
        return { success: false, message: 'Ruta no encontrada' };
      }
      if (route[0].id_driver !== driverId) {
        return { success: false, message: 'Esta ruta no esta asignada a este conductor' };
      }
      if (route[0].status !== 'en_progreso') {
        return { success: false, message: `La ruta tiene estado '${route[0].status}', no se puede completar` };
      }

      const result = await this.dataSource.query(
        `UPDATE routes SET status = 'completada', completed_at = NOW(), modified_at = NOW()
         WHERE id_route = $1 RETURNING *`,
        [routeId],
      );

      // Check if driver has more active routes
      const moreRoutes = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM routes
         WHERE id_driver = $1 AND status = 'en_progreso' AND deleted_at IS NULL`,
        [driverId],
      );
      if (parseInt(moreRoutes[0].count, 10) === 0) {
        await this.updateDriverStatus(driverId, 'disponible');
      }

      return { success: true, route: result[0] };
    } catch (error) {
      console.error('Error completing route:', error);
      return { success: false, message: 'Error al completar la ruta' };
    }
  }

  async getDriverLocationHistory(driverId: number, limit = 100) {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM driver_locations
         WHERE id_driver = $1
         ORDER BY recorded_at DESC
         LIMIT $2`,
        [driverId, limit],
      );
      return result;
    } catch (error) {
      console.error('Error getting driver location history:', error);
      throw error;
    }
  }
}
