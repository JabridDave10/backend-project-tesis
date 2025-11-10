import { Injectable } from '@nestjs/common';
import { UpdateDriverDto } from '../dto/update-driver.dto';

/**
 * DriverQueryBuilder
 *
 * Responsabilidad única: Construir queries SQL dinámicas para operaciones con drivers
 *
 * Encapsula la lógica de construcción de queries complejas, especialmente
 * para actualizaciones dinámicas donde solo algunos campos se modifican.
 */
@Injectable()
export class DriverQueryBuilder {
  /**
   * Construye una query UPDATE dinámica basada en los campos proporcionados
   *
   * @param updateDriverDto - DTO con los campos a actualizar
   * @returns Objeto con la query SQL y los valores parametrizados
   *
   * @example
   * const { query, values } = builder.buildUpdateQuery({ license_number: '123' });
   * // query = "UPDATE drivers SET license_number = $1, modified_at = CURRENT_TIMESTAMP WHERE id_driver = $2"
   * // values = ['123']
   */
  buildUpdateQuery(updateDriverDto: UpdateDriverDto): {
    query: string;
    values: any[];
  } {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // ==================== INFORMACIÓN DE LICENCIA ====================

    if (updateDriverDto.license_number !== undefined) {
      updateFields.push(`license_number = $${paramIndex++}`);
      values.push(updateDriverDto.license_number);
    }

    if (updateDriverDto.license_categories !== undefined) {
      updateFields.push(`license_categories = $${paramIndex++}`);
      values.push(updateDriverDto.license_categories.join(','));
    }

    if (updateDriverDto.license_issue_date !== undefined) {
      updateFields.push(`license_issue_date = $${paramIndex++}`);
      values.push(updateDriverDto.license_issue_date);
    }

    if (updateDriverDto.license_expiry_date !== undefined) {
      updateFields.push(`license_expiry_date = $${paramIndex++}`);
      values.push(updateDriverDto.license_expiry_date);
    }

    if (updateDriverDto.license_issuing_authority !== undefined) {
      updateFields.push(`license_issuing_authority = $${paramIndex++}`);
      values.push(updateDriverDto.license_issuing_authority);
    }

    if (updateDriverDto.license_photo !== undefined) {
      updateFields.push(`license_photo = $${paramIndex++}`);
      values.push(updateDriverDto.license_photo);
    }

    // ==================== INFORMACIÓN MÉDICA ====================

    if (updateDriverDto.blood_type !== undefined) {
      updateFields.push(`blood_type = $${paramIndex++}`);
      values.push(updateDriverDto.blood_type);
    }

    if (updateDriverDto.medical_certificate_date !== undefined) {
      updateFields.push(`medical_certificate_date = $${paramIndex++}`);
      values.push(updateDriverDto.medical_certificate_date);
    }

    if (updateDriverDto.medical_certificate_expiry !== undefined) {
      updateFields.push(`medical_certificate_expiry = $${paramIndex++}`);
      values.push(updateDriverDto.medical_certificate_expiry);
    }

    if (updateDriverDto.medical_restrictions !== undefined) {
      updateFields.push(`medical_restrictions = $${paramIndex++}`);
      values.push(updateDriverDto.medical_restrictions);
    }

    // ==================== CONTACTO DE EMERGENCIA ====================

    if (updateDriverDto.emergency_contact_name !== undefined) {
      updateFields.push(`emergency_contact_name = $${paramIndex++}`);
      values.push(updateDriverDto.emergency_contact_name);
    }

    if (updateDriverDto.emergency_contact_relationship !== undefined) {
      updateFields.push(`emergency_contact_relationship = $${paramIndex++}`);
      values.push(updateDriverDto.emergency_contact_relationship);
    }

    if (updateDriverDto.emergency_contact_phone !== undefined) {
      updateFields.push(`emergency_contact_phone = $${paramIndex++}`);
      values.push(updateDriverDto.emergency_contact_phone);
    }

    // ==================== OTROS DATOS ====================

    if (updateDriverDto.address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      values.push(updateDriverDto.address);
    }

    if (updateDriverDto.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(updateDriverDto.notes);
    }

    // Agregar timestamp de modificación
    updateFields.push(`modified_at = CURRENT_TIMESTAMP`);

    // Construir query final
    const query = `
      UPDATE drivers
      SET ${updateFields.join(', ')}
      WHERE id_driver = $${paramIndex}
      RETURNING *
    `;

    return { query, values };
  }

  /**
   * Construye una query SELECT con JOINs para obtener información completa del conductor
   *
   * @param includeUser - Si se debe incluir información del usuario relacionado
   * @returns Query SQL para SELECT
   */
  buildSelectQuery(includeUser: boolean = true): string {
    if (includeUser) {
      return `
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.identification
        FROM drivers d
        INNER JOIN users u ON d.id_user = u.id_user
      `;
    }

    return `SELECT * FROM drivers d`;
  }

  /**
   * Construye la cláusula WHERE para filtros comunes
   *
   * @param filters - Objeto con filtros a aplicar
   * @returns Cláusula WHERE SQL
   */
  buildWhereClause(filters: {
    id?: number;
    userId?: number;
    status?: string;
    excludeDeleted?: boolean;
  }): { whereClause: string; values: any[] } {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.id !== undefined) {
      conditions.push(`d.id_driver = $${paramIndex++}`);
      values.push(filters.id);
    }

    if (filters.userId !== undefined) {
      conditions.push(`d.id_user = $${paramIndex++}`);
      values.push(filters.userId);
    }

    if (filters.status !== undefined) {
      conditions.push(`d.status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.excludeDeleted !== false) {
      // Por defecto excluir eliminados
      conditions.push(`d.deleted_at IS NULL`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { whereClause, values };
  }
}
