import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { UpdateStockDto, ReserveStockDto } from './dto/stock.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { MovementType } from './enums/product.enums';

/**
 * StockService
 *
 * Responsabilidad: Gestión de inventario (stock) y movimientos
 * - Control de disponibilidad
 * - Reservas para rutas
 * - Movimientos de entrada/salida
 */
@Injectable()
export class StockService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Obtener stock de un producto en una bodega
   */
  async getStock(productId: number, warehouseId: number): Promise<Stock | null> {
    try {
      const query = `
        SELECT s.*, p.name as product_name, p.sku, w.location as warehouse_location
        FROM stock s
        INNER JOIN products p ON s.id_product = p.id_product
        INNER JOIN warehouses w ON s.id_warehouse = w.id_warehouse
        WHERE s.id_product = $1 AND s.id_warehouse = $2
      `;
      const result = await this.dataSource.query(query, [productId, warehouseId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error al obtener stock:', error);
      return null;
    }
  }

  /**
   * Obtener todo el stock de un producto en todas las bodegas
   */
  async getStockByProduct(productId: number): Promise<Stock[]> {
    try {
      const query = `
        SELECT s.*, p.name as product_name, p.sku, w.location as warehouse_location
        FROM stock s
        INNER JOIN products p ON s.id_product = p.id_product
        INNER JOIN warehouses w ON s.id_warehouse = w.id_warehouse
        WHERE s.id_product = $1
        ORDER BY s.updated_at DESC
      `;
      return await this.dataSource.query(query, [productId]);
    } catch (error) {
      console.error('Error al obtener stock por producto:', error);
      return [];
    }
  }

  /**
   * Obtener todo el stock de una bodega
   */
  async getStockByWarehouse(warehouseId: number): Promise<Stock[]> {
    try {
      const query = `
        SELECT s.*, p.name as product_name, p.sku, p.primary_unit_name
        FROM stock s
        INNER JOIN products p ON s.id_product = p.id_product
        WHERE s.id_warehouse = $1
        ORDER BY p.name ASC
      `;
      return await this.dataSource.query(query, [warehouseId]);
    } catch (error) {
      console.error('Error al obtener stock por bodega:', error);
      return [];
    }
  }

  /**
   * Verificar si hay stock disponible suficiente
   */
  async checkAvailability(
    productId: number,
    warehouseId: number,
    quantity: number,
  ): Promise<boolean> {
    try {
      const stock = await this.getStock(productId, warehouseId);
      if (!stock) return false;

      return stock.quantity_available >= quantity;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  }

  /**
   * Reservar stock para una ruta
   */
  async reserveStock(reserveDto: ReserveStockDto): Promise<Stock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que existe stock suficiente
      const stock = await this.getStock(
        reserveDto.id_product,
        reserveDto.id_warehouse,
      );

      if (!stock) {
        throw new NotFoundException(
          'No existe registro de stock para este producto en esta bodega',
        );
      }

      if (stock.quantity_available < reserveDto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${stock.quantity_available}, Solicitado: ${reserveDto.quantity}`,
        );
      }

      // Actualizar stock: restar de disponible, sumar a reservado
      const updateQuery = `
        UPDATE stock
        SET quantity_available = quantity_available - $1,
            reserved_quantity = reserved_quantity + $1,
            updated_by = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_product = $3 AND id_warehouse = $4
        RETURNING *
      `;

      const result = await queryRunner.query(updateQuery, [
        reserveDto.quantity,
        reserveDto.reserved_by,
        reserveDto.id_product,
        reserveDto.id_warehouse,
      ]);

      // Registrar movimiento
      const movementQuery = `
        INSERT INTO stock_movements (
          id_product, id_warehouse_origin, movement_type, quantity, unit_type, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await queryRunner.query(movementQuery, [
        reserveDto.id_product,
        reserveDto.id_warehouse,
        MovementType.RESERVATION,
        reserveDto.quantity,
        stock.unit_type,
        'Reserva para ruta',
        reserveDto.reserved_by,
      ]);

      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al reservar stock:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Liberar stock reservado (cuando se cancela una ruta)
   */
  async releaseReservedStock(
    productId: number,
    warehouseId: number,
    quantity: number,
    userId: number,
  ): Promise<Stock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stock = await this.getStock(productId, warehouseId);

      if (!stock) {
        throw new NotFoundException('Stock no encontrado');
      }

      if (stock.reserved_quantity < quantity) {
        throw new BadRequestException(
          `Cantidad reservada insuficiente. Reservado: ${stock.reserved_quantity}, Solicitado liberar: ${quantity}`,
        );
      }

      // Actualizar stock: restar de reservado, sumar a disponible
      const updateQuery = `
        UPDATE stock
        SET quantity_available = quantity_available + $1,
            reserved_quantity = reserved_quantity - $1,
            updated_by = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_product = $3 AND id_warehouse = $4
        RETURNING *
      `;

      const result = await queryRunner.query(updateQuery, [
        quantity,
        userId,
        productId,
        warehouseId,
      ]);

      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al liberar stock reservado:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Registrar entrada de stock (compra, producción, devolución)
   */
  async addStock(movementDto: CreateStockMovementDto): Promise<Stock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar que existe bodega de destino
      if (!movementDto.id_warehouse_destination) {
        throw new BadRequestException(
          'Se requiere bodega de destino para entrada de stock',
        );
      }

      // Verificar si existe registro de stock
      const existingStock = await this.getStock(
        movementDto.id_product,
        movementDto.id_warehouse_destination,
      );

      let result;

      if (existingStock) {
        // Actualizar stock existente
        const updateQuery = `
          UPDATE stock
          SET quantity_available = quantity_available + $1,
              updated_by = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id_product = $3 AND id_warehouse = $4
          RETURNING *
        `;

        result = await queryRunner.query(updateQuery, [
          movementDto.quantity,
          movementDto.created_by,
          movementDto.id_product,
          movementDto.id_warehouse_destination,
        ]);
      } else {
        // Crear nuevo registro de stock
        const insertQuery = `
          INSERT INTO stock (
            id_product, id_warehouse, quantity_available, reserved_quantity, unit_type, updated_by
          )
          VALUES ($1, $2, $3, 0, $4, $5)
          RETURNING *
        `;

        result = await queryRunner.query(insertQuery, [
          movementDto.id_product,
          movementDto.id_warehouse_destination,
          movementDto.quantity,
          movementDto.unit_type,
          movementDto.created_by,
        ]);
      }

      // Registrar movimiento
      const movementQuery = `
        INSERT INTO stock_movements (
          id_product, id_warehouse_destination, id_batch, movement_type, quantity, unit_type, reference_number, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      await queryRunner.query(movementQuery, [
        movementDto.id_product,
        movementDto.id_warehouse_destination,
        movementDto.id_batch || null,
        movementDto.movement_type,
        movementDto.quantity,
        movementDto.unit_type,
        movementDto.reference_number || null,
        movementDto.notes || null,
        movementDto.created_by,
      ]);

      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al agregar stock:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Registrar salida de stock (venta, despacho, baja)
   */
  async removeStock(movementDto: CreateStockMovementDto): Promise<Stock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar que existe bodega de origen
      if (!movementDto.id_warehouse_origin) {
        throw new BadRequestException(
          'Se requiere bodega de origen para salida de stock',
        );
      }

      const stock = await this.getStock(
        movementDto.id_product,
        movementDto.id_warehouse_origin,
      );

      if (!stock) {
        throw new NotFoundException('Stock no encontrado');
      }

      // Para despachos, se resta de reservado. Para otras salidas, de disponible
      if (movementDto.movement_type === MovementType.DISPATCH) {
        if (stock.reserved_quantity < movementDto.quantity) {
          throw new BadRequestException(
            `Stock reservado insuficiente. Reservado: ${stock.reserved_quantity}, Solicitado: ${movementDto.quantity}`,
          );
        }

        const updateQuery = `
          UPDATE stock
          SET reserved_quantity = reserved_quantity - $1,
              updated_by = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id_product = $3 AND id_warehouse = $4
          RETURNING *
        `;

        const result = await queryRunner.query(updateQuery, [
          movementDto.quantity,
          movementDto.created_by,
          movementDto.id_product,
          movementDto.id_warehouse_origin,
        ]);

        // Registrar movimiento
        await this.recordMovement(queryRunner, movementDto);

        await queryRunner.commitTransaction();
        return result[0];
      } else {
        // Salida normal (exit, adjustment)
        if (stock.quantity_available < movementDto.quantity) {
          throw new BadRequestException(
            `Stock disponible insuficiente. Disponible: ${stock.quantity_available}, Solicitado: ${movementDto.quantity}`,
          );
        }

        const updateQuery = `
          UPDATE stock
          SET quantity_available = quantity_available - $1,
              updated_by = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id_product = $3 AND id_warehouse = $4
          RETURNING *
        `;

        const result = await queryRunner.query(updateQuery, [
          movementDto.quantity,
          movementDto.created_by,
          movementDto.id_product,
          movementDto.id_warehouse_origin,
        ]);

        // Registrar movimiento
        await this.recordMovement(queryRunner, movementDto);

        await queryRunner.commitTransaction();
        return result[0];
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al retirar stock:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Método auxiliar para registrar movimientos
   */
  private async recordMovement(queryRunner: any, movementDto: CreateStockMovementDto): Promise<void> {
    const movementQuery = `
      INSERT INTO stock_movements (
        id_product, id_warehouse_origin, id_warehouse_destination, id_batch, movement_type, quantity, unit_type, reference_number, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    await queryRunner.query(movementQuery, [
      movementDto.id_product,
      movementDto.id_warehouse_origin || null,
      movementDto.id_warehouse_destination || null,
      movementDto.id_batch || null,
      movementDto.movement_type,
      movementDto.quantity,
      movementDto.unit_type,
      movementDto.reference_number || null,
      movementDto.notes || null,
      movementDto.created_by,
    ]);
  }

  /**
   * Obtener historial de movimientos de un producto
   */
  async getMovementHistory(productId: number, limit: number = 50) {
    try {
      const query = `
        SELECT sm.*,
               p.name as product_name, p.sku,
               wo.location as origin_location,
               wd.location as destination_location,
               u.first_name, u.last_name
        FROM stock_movements sm
        INNER JOIN products p ON sm.id_product = p.id_product
        LEFT JOIN warehouses wo ON sm.id_warehouse_origin = wo.id_warehouse
        LEFT JOIN warehouses wd ON sm.id_warehouse_destination = wd.id_warehouse
        LEFT JOIN users u ON sm.created_by = u.id_user
        WHERE sm.id_product = $1
        ORDER BY sm.created_at DESC
        LIMIT $2
      `;
      return await this.dataSource.query(query, [productId, limit]);
    } catch (error) {
      console.error('Error al obtener historial de movimientos:', error);
      return [];
    }
  }
}
