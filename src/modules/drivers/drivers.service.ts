import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { StorageService } from '../storage/storage.service';
import { DriverQueryBuilder } from './services/driver-query.builder';

/**
 * DriversService - Refactorizado con SRP
 *
 * Responsabilidad única: Orquestar operaciones de negocio para conductores
 *
 * Delega:
 * - Construcción de queries → DriverQueryBuilder
 * - Validación de archivos → FileValidationService (en controller)
 * - Almacenamiento de archivos → StorageService
 */
@Injectable()
export class DriversService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private storageService: StorageService,
    private queryBuilder: DriverQueryBuilder,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    try {
      const query = `
        INSERT INTO drivers (
          id_user, license_number, license_categories, license_issue_date, license_expiry_date,
          license_issuing_authority, license_photo, blood_type, medical_certificate_date,
          medical_certificate_expiry, medical_restrictions, emergency_contact_name,
          emergency_contact_relationship, emergency_contact_phone, address, status, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;

      const values = [
        createDriverDto.id_user,
        createDriverDto.license_number,
        createDriverDto.license_categories.join(','), // Array a string separado por comas
        createDriverDto.license_issue_date,
        createDriverDto.license_expiry_date,
        createDriverDto.license_issuing_authority,
        createDriverDto.license_photo || null,
        createDriverDto.blood_type,
        createDriverDto.medical_certificate_date,
        createDriverDto.medical_certificate_expiry,
        createDriverDto.medical_restrictions || null,
        createDriverDto.emergency_contact_name,
        createDriverDto.emergency_contact_relationship,
        createDriverDto.emergency_contact_phone,
        createDriverDto.address || null,
        'disponible', // Estado auto-asignado
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

      // Delegar construcción de query al QueryBuilder
      const { query, values } = this.queryBuilder.buildUpdateQuery(updateDriverDto);

      // Agregar el ID al final de los valores
      values.push(id);

      // Ejecutar query
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
        ORDER BY d.created_at DESC
      `;
      return await this.dataSource.query(query);
    } catch (error) {
      console.error('Error al buscar conductores disponibles:', error);
      return [];
    }
  }

  async uploadLicense(id: number, file: Express.Multer.File): Promise<Driver> {
    try {
      // Obtener datos completos del conductor incluyendo información del usuario
      const query = `
        SELECT d.*, u.identification, u.first_name, u.last_name, u.email, u.phone
        FROM drivers d
        INNER JOIN users u ON d.id_user = u.id_user
        WHERE d.id_driver = $1 AND d.deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [id]);

      if (!result[0]) {
        throw new NotFoundException(`Conductor con ID ${id} no encontrado`);
      }

      const driver = result[0];

      // Construir nombre de carpeta: CC-{identification}-{first_name}-{last_name}
      const folderName = this.storageService.sanitizeFolderName(
        `CC-${driver.identification}-${driver.first_name}-${driver.last_name}`,
      );

      // Obtener extensión del archivo
      const fileExtension = file.originalname.split('.').pop();

      // Construir nombre de archivo: licencia-{identification}.{extension}
      const fileName = `licencia-${driver.identification}.${fileExtension}`;

      // Versionar archivo existente si ya hay una licencia
      if (driver.license_photo) {
        const baseFileName = `licencia-${driver.identification}`;
        await this.storageService.versionExistingFile(folderName, baseFileName);
      }

      // Subir el nuevo archivo a Supabase Storage con la estructura personalizada
      const fileUrl = await this.storageService.uploadFile(file, folderName, fileName);

      // Actualizar la base de datos con la nueva URL
      const updateQuery = `
        UPDATE drivers
        SET license_photo = $1, modified_at = CURRENT_TIMESTAMP
        WHERE id_driver = $2
        RETURNING *
      `;

      const updateResult = await this.dataSource.query(updateQuery, [fileUrl, id]);
      return updateResult[0];
    } catch (error) {
      console.error('Error al subir licencia del conductor:', error);
      throw error;
    }
  }
}
