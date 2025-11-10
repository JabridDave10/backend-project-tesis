import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { StorageService } from '../storage/storage.service';

/**
 * ProductsService
 *
 * Responsabilidad: Gestión CRUD de productos con soporte multi-tenant
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private storageService: StorageService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Verificar que no exista un producto con el mismo SKU en la compañía
      const existingQuery = `
        SELECT id_product FROM products
        WHERE id_company = $1 AND sku = $2 AND deleted_at IS NULL
      `;
      const existing = await this.dataSource.query(existingQuery, [
        createProductDto.id_company,
        createProductDto.sku,
      ]);

      if (existing.length > 0) {
        throw new ConflictException(
          `Ya existe un producto con el SKU "${createProductDto.sku}" en esta compañía`,
        );
      }

      const query = `
        INSERT INTO products (
          id_company, id_category, sku, name, description,
          primary_unit_type, primary_unit_name, weight_per_unit, volume_per_unit,
          width, height, length,
          requires_refrigeration, min_temperature, max_temperature,
          is_fragile, is_hazardous,
          requires_batch_control, requires_expiry_date,
          photo, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `;

      const values = [
        createProductDto.id_company,
        createProductDto.id_category || null,
        createProductDto.sku,
        createProductDto.name,
        createProductDto.description || null,
        createProductDto.primary_unit_type,
        createProductDto.primary_unit_name,
        createProductDto.weight_per_unit || null,
        createProductDto.volume_per_unit || null,
        createProductDto.width || null,
        createProductDto.height || null,
        createProductDto.length || null,
        createProductDto.requires_refrigeration || false,
        createProductDto.min_temperature || null,
        createProductDto.max_temperature || null,
        createProductDto.is_fragile || false,
        createProductDto.is_hazardous || false,
        createProductDto.requires_batch_control || false,
        createProductDto.requires_expiry_date || false,
        createProductDto.photo || null,
        createProductDto.notes || null,
      ];

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }

  async findAll(companyId?: number): Promise<Product[]> {
    try {
      let query = `
        SELECT p.*, pc.name as category_name
        FROM products p
        LEFT JOIN product_categories pc ON p.id_category = pc.id_category
        WHERE p.deleted_at IS NULL
      `;

      const values: any[] = [];

      if (companyId) {
        query += ` AND p.id_company = $1`;
        values.push(companyId);
      }

      query += ` ORDER BY p.created_at DESC`;

      return await this.dataSource.query(query, values);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const query = `
        SELECT p.*, pc.name as category_name
        FROM products p
        LEFT JOIN product_categories pc ON p.id_category = pc.id_category
        WHERE p.id_product = $1 AND p.deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [id]);

      if (!result[0]) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      return result[0];
    } catch (error) {
      console.error('Error al buscar producto:', error);
      throw error;
    }
  }

  async findBySku(sku: string, companyId: number): Promise<Product | null> {
    try {
      const query = `
        SELECT * FROM products
        WHERE sku = $1 AND id_company = $2 AND deleted_at IS NULL
      `;
      const result = await this.dataSource.query(query, [sku, companyId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error al buscar producto por SKU:', error);
      return null;
    }
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    try {
      const query = `
        SELECT * FROM products
        WHERE id_category = $1 AND deleted_at IS NULL
        ORDER BY name ASC
      `;
      return await this.dataSource.query(query, [categoryId]);
    } catch (error) {
      console.error('Error al buscar productos por categoría:', error);
      return [];
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      // Verificar que el producto existe
      await this.findOne(id);

      // Si se está actualizando el SKU, verificar que no exista otro con el mismo SKU
      if (updateProductDto.sku) {
        const existingQuery = `
          SELECT id_product FROM products
          WHERE sku = $1 AND id_product != $2 AND deleted_at IS NULL
        `;
        const existing = await this.dataSource.query(existingQuery, [
          updateProductDto.sku,
          id,
        ]);

        if (existing.length > 0) {
          throw new ConflictException(
            `Ya existe otro producto con el SKU "${updateProductDto.sku}"`,
          );
        }
      }

      // Construir query dinámico
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateProductDto.id_category !== undefined) {
        updateFields.push(`id_category = $${paramIndex++}`);
        values.push(updateProductDto.id_category);
      }
      if (updateProductDto.sku !== undefined) {
        updateFields.push(`sku = $${paramIndex++}`);
        values.push(updateProductDto.sku);
      }
      if (updateProductDto.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(updateProductDto.name);
      }
      if (updateProductDto.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(updateProductDto.description);
      }
      if (updateProductDto.primary_unit_type !== undefined) {
        updateFields.push(`primary_unit_type = $${paramIndex++}`);
        values.push(updateProductDto.primary_unit_type);
      }
      if (updateProductDto.primary_unit_name !== undefined) {
        updateFields.push(`primary_unit_name = $${paramIndex++}`);
        values.push(updateProductDto.primary_unit_name);
      }
      if (updateProductDto.weight_per_unit !== undefined) {
        updateFields.push(`weight_per_unit = $${paramIndex++}`);
        values.push(updateProductDto.weight_per_unit);
      }
      if (updateProductDto.volume_per_unit !== undefined) {
        updateFields.push(`volume_per_unit = $${paramIndex++}`);
        values.push(updateProductDto.volume_per_unit);
      }
      if (updateProductDto.width !== undefined) {
        updateFields.push(`width = $${paramIndex++}`);
        values.push(updateProductDto.width);
      }
      if (updateProductDto.height !== undefined) {
        updateFields.push(`height = $${paramIndex++}`);
        values.push(updateProductDto.height);
      }
      if (updateProductDto.length !== undefined) {
        updateFields.push(`length = $${paramIndex++}`);
        values.push(updateProductDto.length);
      }
      if (updateProductDto.requires_refrigeration !== undefined) {
        updateFields.push(`requires_refrigeration = $${paramIndex++}`);
        values.push(updateProductDto.requires_refrigeration);
      }
      if (updateProductDto.min_temperature !== undefined) {
        updateFields.push(`min_temperature = $${paramIndex++}`);
        values.push(updateProductDto.min_temperature);
      }
      if (updateProductDto.max_temperature !== undefined) {
        updateFields.push(`max_temperature = $${paramIndex++}`);
        values.push(updateProductDto.max_temperature);
      }
      if (updateProductDto.is_fragile !== undefined) {
        updateFields.push(`is_fragile = $${paramIndex++}`);
        values.push(updateProductDto.is_fragile);
      }
      if (updateProductDto.is_hazardous !== undefined) {
        updateFields.push(`is_hazardous = $${paramIndex++}`);
        values.push(updateProductDto.is_hazardous);
      }
      if (updateProductDto.requires_batch_control !== undefined) {
        updateFields.push(`requires_batch_control = $${paramIndex++}`);
        values.push(updateProductDto.requires_batch_control);
      }
      if (updateProductDto.requires_expiry_date !== undefined) {
        updateFields.push(`requires_expiry_date = $${paramIndex++}`);
        values.push(updateProductDto.requires_expiry_date);
      }
      if (updateProductDto.photo !== undefined) {
        updateFields.push(`photo = $${paramIndex++}`);
        values.push(updateProductDto.photo);
      }
      if (updateProductDto.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        values.push(updateProductDto.notes);
      }

      if (updateFields.length === 0) {
        throw new BadRequestException('No hay campos para actualizar');
      }

      updateFields.push(`modified_at = CURRENT_TIMESTAMP`);

      const query = `
        UPDATE products
        SET ${updateFields.join(', ')}
        WHERE id_product = $${paramIndex}
        RETURNING *
      `;

      values.push(id);

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);

      const query = `
        UPDATE products
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id_product = $1
      `;
      await this.dataSource.query(query, [id]);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  async uploadPhoto(
    id: number,
    file: Express.Multer.File,
  ): Promise<Product> {
    try {
      const product = await this.findOne(id);

      // Construir nombre de carpeta: producto-{sku}
      const folderName = this.storageService.sanitizeFolderName(
        `producto-${product.sku}`,
      );

      // Obtener extensión del archivo
      const fileExtension = file.originalname.split('.').pop();

      // Construir nombre de archivo: foto-{sku}.{extension}
      const fileName = `foto-${product.sku}.${fileExtension}`;

      // Versionar archivo existente si ya hay una foto
      if (product.photo) {
        const baseFileName = `foto-${product.sku}`;
        await this.storageService.versionExistingFile(folderName, baseFileName);
      }

      // Subir el nuevo archivo
      const fileUrl = await this.storageService.uploadFile(
        file,
        folderName,
        fileName,
      );

      // Actualizar la base de datos
      const updateQuery = `
        UPDATE products
        SET photo = $1, modified_at = CURRENT_TIMESTAMP
        WHERE id_product = $2
        RETURNING *
      `;

      const result = await this.dataSource.query(updateQuery, [fileUrl, id]);
      return result[0];
    } catch (error) {
      console.error('Error al subir foto del producto:', error);
      throw error;
    }
  }
}
