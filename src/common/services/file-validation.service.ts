import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * FileValidationService
 *
 * Responsabilidad única: Validar archivos subidos (tipo, tamaño, formato)
 *
 * Centraliza toda la lógica de validación de archivos para reutilización
 * en múltiples controladores (users, drivers, vehicles, etc.)
 */
@Injectable()
export class FileValidationService {
  /**
   * Valida que el archivo sea una imagen (JPG, JPEG, PNG)
   * @param file - Archivo a validar
   * @param maxSizeMB - Tamaño máximo en MB (por defecto 5MB)
   * @throws BadRequestException si el archivo no es válido
   */
  validateImageFile(file: Express.Multer.File, maxSizeMB: number = 5): void {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan: JPG, JPEG, PNG',
      );
    }

    // Validar tamaño
    this.validateFileSize(file, maxSizeMB);
  }

  /**
   * Valida que el archivo sea una imagen o PDF (para documentos)
   * @param file - Archivo a validar
   * @param maxSizeMB - Tamaño máximo en MB (por defecto 5MB)
   * @throws BadRequestException si el archivo no es válido
   */
  validateDocumentFile(file: Express.Multer.File, maxSizeMB: number = 5): void {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan: JPG, JPEG, PNG, PDF',
      );
    }

    // Validar tamaño
    this.validateFileSize(file, maxSizeMB);
  }

  /**
   * Valida el tamaño de un archivo
   * @param file - Archivo a validar
   * @param maxSizeMB - Tamaño máximo en MB
   * @throws BadRequestException si el archivo excede el tamaño permitido
   */
  private validateFileSize(file: Express.Multer.File, maxSizeMB: number): void {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`,
      );
    }
  }

  /**
   * Obtiene la extensión de un archivo
   * @param filename - Nombre del archivo
   * @returns Extensión del archivo (ej: 'jpg', 'png', 'pdf')
   */
  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }
}
