import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('SUPABASE_S3_ENDPOINT');
    const region = this.configService.get<string>('SUPABASE_S3_REGION');
    const accessKeyId = this.configService.get<string>('SUPABASE_S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('SUPABASE_S3_SECRET_KEY');
    const bucketName = this.configService.get<string>('SUPABASE_S3_BUCKET');

    if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Supabase S3 configuration is missing. Please check your environment variables.');
    }

    this.bucketName = bucketName;
    this.endpoint = endpoint.replace('/storage/v1/s3', '');

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    this.logger.log('Storage service initialized with Supabase S3');
  }

  /**
   * Sube un archivo a Supabase Storage via S3
   * @param file - El archivo a subir
   * @param folder - Carpeta dentro del bucket (ej: 'licenses', 'vehicles')
   * @param customFileName - Nombre personalizado del archivo (opcional)
   * @returns URL pública del archivo
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = '',
    customFileName?: string,
  ): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = customFileName || `${uuidv4()}.${fileExtension}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const publicUrl = this.getPublicUrl(key);
      this.logger.log(`File uploaded successfully: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      this.logger.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  /**
   * Elimina un archivo de Supabase Storage via S3
   * @param fileUrl - URL completa del archivo a eliminar
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);

      if (!key) {
        this.logger.warn('Invalid file URL provided for deletion');
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('Error deleting file from S3:', error);
      // No lanzamos excepción para evitar que falle la actualización si el archivo no existe
    }
  }

  /**
   * Verifica si un archivo existe en S3
   * @param fileUrl - URL del archivo
   * @returns true si existe, false si no
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);

      if (!key) {
        return false;
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Genera la URL pública del archivo
   * @param key - Clave del archivo en S3
   * @returns URL pública
   */
  getPublicUrl(key: string): string {
    return `${this.endpoint}/storage/v1/object/public/${this.bucketName}/${key}`;
  }

  /**
   * Extrae la clave (key) de una URL completa
   * @param fileUrl - URL completa del archivo
   * @returns Clave del archivo
   */
  private extractKeyFromUrl(fileUrl: string): string | null {
    try {
      const match = fileUrl.match(/\/public\/[^\/]+\/(.+)$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Valida el tipo de archivo
   * @param mimetype - Tipo MIME del archivo
   * @param allowedTypes - Tipos permitidos
   * @returns true si es válido
   */
  validateFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
  }

  /**
   * Valida el tamaño del archivo
   * @param size - Tamaño en bytes
   * @param maxSize - Tamaño máximo permitido en bytes
   * @returns true si es válido
   */
  validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  /**
   * Sanitiza el nombre de carpeta removiendo caracteres especiales
   * @param folderName - Nombre de carpeta a sanitizar
   * @returns Nombre de carpeta sanitizado
   */
  sanitizeFolderName(folderName: string): string {
    return folderName
      .normalize('NFD') // Normalizar para separar caracteres y acentos
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (tildes, acentos)
      .replace(/[^a-zA-Z0-9-_\s]/g, '') // Remover caracteres especiales excepto guiones, guión bajo y espacios
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .trim();
  }

  /**
   * Lista todos los archivos en una carpeta específica
   * @param folder - Nombre de la carpeta
   * @returns Lista de claves (keys) de archivos
   */
  async listFilesInFolder(folder: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: `${folder}/`,
      });

      const response = await this.s3Client.send(command);
      return response.Contents?.map((item) => item.Key || '') || [];
    } catch (error) {
      this.logger.error(`Error listing files in folder ${folder}:`, error);
      return [];
    }
  }

  /**
   * Versiona un archivo existente agregando timestamp antes de la extensión
   * @param folderPath - Ruta de la carpeta donde está el archivo
   * @param baseFileName - Nombre base del archivo (ej: licencia-1234567890)
   * @returns true si se versionó exitosamente, false si no existía
   */
  async versionExistingFile(folderPath: string, baseFileName: string): Promise<boolean> {
    try {
      // Listar archivos en la carpeta
      const files = await this.listFilesInFolder(folderPath);

      // Buscar archivo que coincida con el nombre base (sin considerar versiones)
      const existingFile = files.find((file) => {
        const fileName = file.split('/').pop() || '';
        return fileName.startsWith(baseFileName) && !fileName.includes('-202'); // No incluir versiones anteriores
      });

      if (!existingFile) {
        return false;
      }

      // Extraer extensión
      const parts = existingFile.split('.');
      const extension = parts.pop();
      const fileNameWithoutExt = parts.join('.');

      // Crear nuevo nombre con timestamp
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const newKey = `${fileNameWithoutExt}-${timestamp}.${extension}`;

      // Copiar archivo con nuevo nombre (versión)
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${existingFile}`,
        Key: newKey,
      });

      await this.s3Client.send(copyCommand);
      this.logger.log(`File versioned: ${existingFile} -> ${newKey}`);

      // Eliminar el archivo original (se subirá el nuevo)
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: existingFile,
      });

      await this.s3Client.send(deleteCommand);

      return true;
    } catch (error) {
      this.logger.error('Error versioning file:', error);
      return false;
    }
  }
}
