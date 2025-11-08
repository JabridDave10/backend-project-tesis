import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { AuthGuard } from '../auth/auth.guard';
import { FileValidationService } from '../../common/services/file-validation.service';

/**
 * DriversController - Refactorizado con SRP
 *
 * Responsabilidad única: Manejar peticiones HTTP relacionadas con conductores
 *
 * Delega:
 * - Validación de archivos → FileValidationService
 * - Lógica de negocio → DriversService
 */
@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly fileValidationService: FileValidationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo conductor' })
  @ApiResponse({ status: 201, description: 'Conductor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDriverDto: CreateDriverDto) {
    const driver = await this.driversService.create(createDriverDto);
    return {
      message: 'Conductor creado exitosamente',
      data: driver
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los conductores' })
  @ApiResponse({ status: 200, description: 'Lista de conductores' })
  async findAll() {
    return await this.driversService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Obtener conductores disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de conductores disponibles' })
  async getAvailableDrivers() {
    return await this.driversService.getAvailableDrivers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un conductor por ID' })
  @ApiResponse({ status: 200, description: 'Datos del conductor' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.driversService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un conductor' })
  @ApiResponse({ status: 200, description: 'Conductor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    try {
      const driver = await this.driversService.update(+id, updateDriverDto);
      return {
        message: 'Conductor actualizado exitosamente',
        data: driver
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un conductor (soft delete)' })
  @ApiResponse({ status: 204, description: 'Conductor eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async remove(@Param('id') id: string) {
    await this.driversService.remove(+id);
  }

  @Post(':id/upload-license')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir foto de licencia del conductor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (jpg, jpeg, png, pdf) - Máximo 5MB',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Licencia subida exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async uploadLicense(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Delegar validación al FileValidationService
    this.fileValidationService.validateDocumentFile(file, 5);

    try {
      const result = await this.driversService.uploadLicense(+id, file);
      return {
        message: 'Licencia subida exitosamente',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }
}
