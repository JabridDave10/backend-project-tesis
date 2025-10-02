import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo conductor' })
  @ApiResponse({ status: 201, description: 'Conductor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDriverDto: CreateDriverDto) {
    try {
      const driver = await this.driversService.create(createDriverDto);
      return {
        message: 'Conductor creado exitosamente',
        data: driver
      };
    } catch (error) {
      throw error;
    }
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
}
