import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
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

  @Get('compatible-drivers/:vehicleId')
  @ApiOperation({ summary: 'Obtener conductores compatibles con el tipo de vehiculo' })
  @ApiResponse({ status: 200, description: 'Lista de conductores compatibles' })
  async getCompatibleDrivers(@Param('vehicleId') vehicleId: string) {
    return await this.vehiclesService.getCompatibleDrivers(+vehicleId);
  }

  @Get('compatible-types')
  @ApiOperation({ summary: 'Obtener tipos de vehiculo compatibles con las licencias dadas' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de vehiculo compatibles' })
  @ApiQuery({ name: 'licenses', description: 'Categorias de licencia separadas por coma', example: 'A1,B1' })
  async getCompatibleTypes(@Query('licenses') licenses: string) {
    const licenseArray = licenses ? licenses.split(',').map(l => l.trim()) : [];
    return this.vehiclesService.getCompatibleVehicleTypes(licenseArray);
  }

  @Get('required-licenses/:vehicleType')
  @ApiOperation({ summary: 'Obtener licencias requeridas para un tipo de vehiculo' })
  @ApiResponse({ status: 200, description: 'Lista de licencias requeridas' })
  async getRequiredLicenses(@Param('vehicleType') vehicleType: string) {
    return this.vehiclesService.getRequiredLicenses(vehicleType);
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
