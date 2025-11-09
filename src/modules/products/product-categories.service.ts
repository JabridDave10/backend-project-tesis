import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/create-product-category.dto';

/**
 * ProductCategoriesService
 *
 * Responsabilidad: Gestión CRUD de categorías de productos con soporte multi-tenant
 */
@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(
    createCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    try {
      // Verificar que no exista una categoría con el mismo nombre en la compañía
      const existingQuery = `
        SELECT id_category FROM product_categories
        WHERE id_company = $1 AND LOWER(name) = LOWER($2) AND deleted_at IS NULL
      `;
      const existing = await this.dataSource.query(existingQuery, [
        createCategoryDto.id_company,
        createCategoryDto.name,
      ]);

      if (existing.length > 0) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${createCategoryDto.name}" en esta compañía`,
        );
      }

      const query = `
        INSERT INTO product_categories (
          id_company, name, description, default_storage_type, icon, color
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        createCategoryDto.id_company,
        createCategoryDto.name,
        createCategoryDto.description || null,
        createCategoryDto.default_storage_type || null,
        createCategoryDto.icon || null,
        createCategoryDto.color || null,
      ];

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  }

  async findAll(companyId?: number): Promise<ProductCategory[]> {
    try {
      let query = `
        SELECT pc.*, COUNT(p.id_product) as product_count
        FROM product_categories pc
        LEFT JOIN products p ON pc.id_category = p.id_category AND p.deleted_at IS NULL
        WHERE pc.deleted_at IS NULL
      `;

      const values: any[] = [];

      if (companyId) {
        query += ` AND pc.id_company = $1`;
        values.push(companyId);
      }

      query += ` GROUP BY pc.id_category ORDER BY pc.name ASC`;

      return await this.dataSource.query(query, values);
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<ProductCategory> {
    try {
      const query = `
        SELECT pc.*, COUNT(p.id_product) as product_count
        FROM product_categories pc
        LEFT JOIN products p ON pc.id_category = p.id_category AND p.deleted_at IS NULL
        WHERE pc.id_category = $1 AND pc.deleted_at IS NULL
        GROUP BY pc.id_category
      `;
      const result = await this.dataSource.query(query, [id]);

      if (!result[0]) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }

      return result[0];
    } catch (error) {
      console.error('Error al buscar categoría:', error);
      throw error;
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    try {
      // Verificar que la categoría existe
      await this.findOne(id);

      // Si se está actualizando el nombre, verificar que no exista otra con el mismo nombre
      if (updateCategoryDto.name) {
        const existingQuery = `
          SELECT id_category FROM product_categories
          WHERE LOWER(name) = LOWER($1) AND id_category != $2 AND deleted_at IS NULL
        `;
        const existing = await this.dataSource.query(existingQuery, [
          updateCategoryDto.name,
          id,
        ]);

        if (existing.length > 0) {
          throw new ConflictException(
            `Ya existe otra categoría con el nombre "${updateCategoryDto.name}"`,
          );
        }
      }

      // Construir query dinámico
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateCategoryDto.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(updateCategoryDto.name);
      }
      if (updateCategoryDto.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(updateCategoryDto.description);
      }
      if (updateCategoryDto.default_storage_type !== undefined) {
        updateFields.push(`default_storage_type = $${paramIndex++}`);
        values.push(updateCategoryDto.default_storage_type);
      }
      if (updateCategoryDto.icon !== undefined) {
        updateFields.push(`icon = $${paramIndex++}`);
        values.push(updateCategoryDto.icon);
      }
      if (updateCategoryDto.color !== undefined) {
        updateFields.push(`color = $${paramIndex++}`);
        values.push(updateCategoryDto.color);
      }

      if (updateFields.length === 0) {
        throw new BadRequestException('No hay campos para actualizar');
      }

      updateFields.push(`modified_at = CURRENT_TIMESTAMP`);

      const query = `
        UPDATE product_categories
        SET ${updateFields.join(', ')}
        WHERE id_category = $${paramIndex}
        RETURNING *
      `;

      values.push(id);

      const result = await this.dataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const category: any = await this.findOne(id);

      // Verificar si la categoría tiene productos asociados
      if (category.product_count > 0) {
        throw new BadRequestException(
          `No se puede eliminar la categoría porque tiene ${category.product_count} producto(s) asociado(s)`,
        );
      }

      const query = `
        UPDATE product_categories
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id_category = $1
      `;
      await this.dataSource.query(query, [id]);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
}
