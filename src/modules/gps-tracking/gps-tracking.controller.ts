import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
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
  @ApiResponse({ status: 200, description: 'Info del conductor y ruta activa' })
  @ApiResponse({ status: 404, description: 'Usuario no tiene perfil de conductor' })
  async getMyDriverInfo(@Request() req) {
    const userId = req.user.sub;
    const driver = await this.gpsTrackingService.getDriverByUserId(userId);

    if (!driver) {
      throw new NotFoundException('Esta cuenta no tiene perfil de conductor');
    }

    const activeRoute = await this.gpsTrackingService.getActiveRouteForDriver(
      driver.id_driver,
    );

    const assignedVehicle = await this.gpsTrackingService.getAssignedVehicle(
      driver.id_driver,
    );

    return {
      driver,
      activeRoute,
      assignedVehicle,
    };
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
