import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { GpsTrackingService } from './gps-tracking.service';

@Controller('gps-tracking')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('gps-tracking')
export class GpsTrackingController {
  constructor(private readonly gpsTrackingService: GpsTrackingService) {}

  @Get('active-drivers')
  @ApiOperation({ summary: 'Obtener posiciones activas de conductores' })
  @ApiResponse({ status: 200, description: 'Lista de conductores activos con posicion' })
  async getActiveDrivers() {
    return this.gpsTrackingService.getActiveDriverPositions();
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Obtener estadisticas del dashboard' })
  @ApiResponse({ status: 200, description: 'Estadisticas del dashboard' })
  async getDashboardStats() {
    return this.gpsTrackingService.getDashboardStats();
  }

  @Get('driver/me')
  @ApiOperation({ summary: 'Obtener info del conductor actual (app movil)' })
  @ApiResponse({ status: 200, description: 'Info del conductor, ruta activa y rutas pendientes' })
  @ApiResponse({ status: 404, description: 'Usuario no tiene perfil de conductor' })
  async getMyDriverInfo(@Request() req) {
    const userId = req.user.sub;
    const driver = await this.gpsTrackingService.getDriverByUserId(userId);

    if (!driver) {
      throw new NotFoundException('Esta cuenta no tiene perfil de conductor');
    }

    const [activeRoute, pendingRoutes, assignedVehicle] = await Promise.all([
      this.gpsTrackingService.getActiveRouteForDriver(driver.id_driver),
      this.gpsTrackingService.getPendingRoutesForDriver(driver.id_driver),
      this.gpsTrackingService.getAssignedVehicle(driver.id_driver),
    ]);

    return {
      driver,
      activeRoute,
      pendingRoutes,
      assignedVehicle,
    };
  }

  @Patch('route/:routeId/start')
  @ApiOperation({ summary: 'Iniciar una ruta pendiente (conductor)' })
  @ApiResponse({ status: 200, description: 'Ruta iniciada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede iniciar la ruta' })
  async startRoute(@Request() req, @Param('routeId') routeId: number) {
    const userId = req.user.sub;
    const driver = await this.gpsTrackingService.getDriverByUserId(userId);
    if (!driver) {
      throw new NotFoundException('Perfil de conductor no encontrado');
    }

    const result = await this.gpsTrackingService.startRoute(routeId, driver.id_driver);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Patch('route/:routeId/complete')
  @ApiOperation({ summary: 'Completar una ruta en progreso (conductor)' })
  @ApiResponse({ status: 200, description: 'Ruta completada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede completar la ruta' })
  async completeRoute(@Request() req, @Param('routeId') routeId: number) {
    const userId = req.user.sub;
    const driver = await this.gpsTrackingService.getDriverByUserId(userId);
    if (!driver) {
      throw new NotFoundException('Perfil de conductor no encontrado');
    }

    const result = await this.gpsTrackingService.completeRoute(routeId, driver.id_driver);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Get('driver/:driverId/history')
  @ApiOperation({ summary: 'Obtener historial de posiciones de un conductor' })
  @ApiResponse({ status: 200, description: 'Historial de posiciones' })
  async getDriverHistory(
    @Param('driverId') driverId: number,
    @Query('limit') limit?: number,
  ) {
    return this.gpsTrackingService.getDriverLocationHistory(
      driverId,
      limit || 100,
    );
  }
}
