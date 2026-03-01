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
    const endpoint = this.configService.get<string>('B2_S3_ENDPOINT');
    const region = this.configService.get<string>('B2_S3_REGION');
    const accessKeyId = this.configService.get<string>('B2_S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('B2_S3_SECRET_KEY');
    const bucketName = this.configService.get<string>('B2_S3_BUCKET');

    if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucketName) {
      this.logger.warn('Backblaze B2 S3 configuration is missing. Storage features will be unavailable.');
      this.bucketName = '';
      this.endpoint = '';
      return;
    }

    this.bucketName = bucketName;
    this.endpoint = `https://${endpoint}`;

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    this.logger.log('Storage service initialized with Backblaze B2 S3');
  }

  /**
   * Sube un archivo a Backblaze B2 via S3
   * @param file - El archivo a subir
   * @param folder - Carpeta dentro del bucket (ej: 'licenses', 'vehicles')
   * @param customFileName - Nombre personalizado del archivo (opcional)
   * @returns URL publica del archivo
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
   * Elimina un archivo de Backblaze B2 via S3
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
   * Genera la URL publica del archivo en Backblaze B2
   * Formato: https://f005.backblazeb2.com/file/<bucket>/<key>
   * @param key - Clave del archivo en S3
   * @returns URL publica
   */
  getPublicUrl(key: string): string {
    // Backblaze B2 friendly URL format
    return `${this.endpoint}/file/${this.bucketName}/${key}`;
  }

  /**
   * Extrae la clave (key) de una URL completa
   * Soporta tanto formato Backblaze como Supabase (backward compat)
   * @param fileUrl - URL completa del archivo
   * @returns Clave del archivo
   */
  private extractKeyFromUrl(fileUrl: string): string | null {
    try {
      // Backblaze B2 format: https://s3.region.backblazeb2.com/file/bucket/key
      const b2Match = fileUrl.match(/\/file\/[^\/]+\/(.+)$/);
      if (b2Match) return b2Match[1];

      // Legacy Supabase format: /public/bucket/key
      const supabaseMatch = fileUrl.match(/\/public\/[^\/]+\/(.+)$/);
      if (supabaseMatch) return supabaseMatch[1];

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Valida el tipo de archivo
   * @param mimetype - Tipo MIME del archivo
   * @param allowedTypes - Tipos permitidos
   * @returns true si es valido
   */
  validateFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
  }

  /**
   * Valida el tamano del archivo
   * @param size - Tamano en bytes
   * @param maxSize - Tamano maximo permitido en bytes
   * @returns true si es valido
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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Lista todos los archivos en una carpeta especifica
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
   * Versiona un archivo existente agregando timestamp antes de la extension
   * @param folderPath - Ruta de la carpeta donde esta el archivo
   * @param baseFileName - Nombre base del archivo (ej: licencia-1234567890)
   * @returns true si se versiono exitosamente, false si no existia
   */
  async versionExistingFile(folderPath: string, baseFileName: string): Promise<boolean> {
    try {
      const files = await this.listFilesInFolder(folderPath);

      const existingFile = files.find((file) => {
        const fileName = file.split('/').pop() || '';
        return fileName.startsWith(baseFileName) && !fileName.includes('-202');
      });

      if (!existingFile) {
        return false;
      }

      const parts = existingFile.split('.');
      const extension = parts.pop();
      const fileNameWithoutExt = parts.join('.');

      const timestamp = new Date().toISOString().split('T')[0];
      const newKey = `${fileNameWithoutExt}-${timestamp}.${extension}`;

      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${existingFile}`,
        Key: newKey,
      });

      await this.s3Client.send(copyCommand);
      this.logger.log(`File versioned: ${existingFile} -> ${newKey}`);

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
