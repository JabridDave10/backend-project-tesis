import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo vehículo' })
  @ApiResponse({ status: 201, description: 'Vehículo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    try {
      const vehicle = await this.vehiclesService.create(createVehicleDto);
      return {
        message: 'Vehículo creado exitosamente',
        data: vehicle
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los vehículos' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos' })
  async findAll() {
    return await this.vehiclesService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Obtener vehículos disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos disponibles' })
  async getAvailableVehicles() {
    return await this.vehiclesService.getAvailableVehicles();
  }

  @Get('by-driver/:driverId')
  @ApiOperation({ summary: 'Obtener vehículos de un conductor específico' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos del conductor' })
  async getVehiclesByDriver(@Param('driverId') driverId: string) {
    return await this.vehiclesService.getVehiclesByDriver(+driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  @ApiResponse({ status: 200, description: 'Datos del vehículo' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.vehiclesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @ApiResponse({ status: 200, description: 'Vehículo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    try {
      const vehicle = await this.vehiclesService.update(+id, updateVehicleDto);
      return {
        message: 'Vehículo actualizado exitosamente',
        data: vehicle
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un vehículo (soft delete)' })
  @ApiResponse({ status: 204, description: 'Vehículo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async remove(@Param('id') id: string) {
    await this.vehiclesService.remove(+id);
  }
}
