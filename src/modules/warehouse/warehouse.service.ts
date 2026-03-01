import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/create-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateWarehouseDto) {
    // Validar nombre unico por company
    const existing = await this.dataSource.query(
      `SELECT id_warehouse FROM warehouse WHERE name = $1 AND id_company = $2 AND deleted_at IS NULL`,
      [dto.name, dto.id_company],
    );

    if (existing.length > 0) {
      throw new ConflictException('Ya existe una bodega con ese nombre en esta empresa');
    }

    const result = await this.dataSource.query(
      `INSERT INTO warehouse (name, address, id_company, id_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dto.name, dto.address, dto.id_company, dto.id_status || 1],
    );

    return {
      message: 'Bodega creada exitosamente',
      data: result[0],
    };
  }

  async findAll(companyId?: number) {
    let query = `
      SELECT w.*,
        (SELECT COUNT(*) FROM stock s WHERE s.id_warehouse = w.id_warehouse) as stock_count
      FROM warehouse w
      WHERE w.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (companyId) {
      params.push(companyId);
      query += ` AND w.id_company = $${params.length}`;
    }

    query += ` ORDER BY w.name ASC`;

    return await this.dataSource.query(query, params);
  }

  async findOne(id: number) {
    const result = await this.dataSource.query(
      `SELECT w.*,
        (SELECT COUNT(*) FROM stock s WHERE s.id_warehouse = w.id_warehouse) as stock_count
       FROM warehouse w
       WHERE w.id_warehouse = $1 AND w.deleted_at IS NULL`,
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException('Bodega no encontrada');
    }

    return result[0];
  }

  async update(id: number, dto: UpdateWarehouseDto) {
    // Verificar que existe
    await this.findOne(id);

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }
    if (dto.address !== undefined) {
      fields.push(`address = $${paramIndex++}`);
      values.push(dto.address);
    }
    if (dto.id_status !== undefined) {
      fields.push(`id_status = $${paramIndex++}`);
      values.push(dto.id_status);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No se proporcionaron campos para actualizar');
    }

    fields.push(`modified_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await this.dataSource.query(
      `UPDATE warehouse SET ${fields.join(', ')} WHERE id_warehouse = $${paramIndex} RETURNING *`,
      values,
    );

    return {
      message: 'Bodega actualizada exitosamente',
      data: result[0],
    };
  }

  async remove(id: number) {
    const warehouse = await this.findOne(id);

    // Verificar que no tenga stock activo
    const stockCount = parseInt(warehouse.stock_count) || 0;
    if (stockCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la bodega porque tiene stock activo',
      );
    }

    await this.dataSource.query(
      `UPDATE warehouse SET deleted_at = CURRENT_TIMESTAMP WHERE id_warehouse = $1`,
      [id],
    );

    return { message: 'Bodega eliminada exitosamente' };
  }
}
