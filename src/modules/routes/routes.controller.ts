import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva ruta' })
  @ApiResponse({ status: 201, description: 'Ruta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createRouteDto: CreateRouteDto) {
    try {
      const route = await this.routesService.create(createRouteDto);
      return {
        message: 'Ruta creada exitosamente',
        data: route
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las rutas' })
  @ApiResponse({ status: 200, description: 'Lista de rutas' })
  async findAll() {
    return await this.routesService.findAll();
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Obtener rutas por estado' })
  @ApiResponse({ status: 200, description: 'Lista de rutas filtradas por estado' })
  async getRoutesByStatus(@Param('status') status: string) {
    return await this.routesService.getRoutesByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ruta por ID' })
  @ApiResponse({ status: 200, description: 'Datos de la ruta' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  async findOne(@Param('id') id: string) {
    return await this.routesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ruta' })
  @ApiResponse({ status: 200, description: 'Ruta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  async update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    try {
      const route = await this.routesService.update(+id, updateRouteDto);
      return {
        message: 'Ruta actualizada exitosamente',
        data: route
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de una ruta' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; completed_at?: string }
  ) {
    try {
      const route = await this.routesService.updateStatus(
        +id,
        body.status,
        body.completed_at ? new Date(body.completed_at) : undefined
      );
      return {
        message: 'Estado actualizado exitosamente',
        data: route
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una ruta (soft delete)' })
  @ApiResponse({ status: 204, description: 'Ruta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  async remove(@Param('id') id: string) {
    await this.routesService.remove(+id);
  }
}
