import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('routing')
@Controller('routing')
export class RoutingController {
  private readonly logger = new Logger(RoutingController.name);
  private readonly OSRM_BASE = 'https://router.project-osrm.org';

  // OSRM coords look like 'lon1,lat1;lon2,lat2;...'. Validate to prevent the
  // proxy from forwarding arbitrary paths to the upstream service.
  private validateCoords(coords: string): void {
    if (!coords) {
      throw new BadRequestException('Missing coords query parameter');
    }
    if (!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?(;-?\d+(\.\d+)?,-?\d+(\.\d+)?)*$/.test(coords)) {
      throw new BadRequestException('Invalid coords format. Expected lon,lat[;lon,lat...]');
    }
  }

  private async forwardToOsrm(url: string): Promise<any> {
    try {
      const res = await fetch(url);
      const body = await res.text();
      if (!res.ok) {
        this.logger.warn(`OSRM ${res.status} for ${url}: ${body.slice(0, 200)}`);
        throw new HttpException(
          `OSRM upstream error (${res.status})`,
          res.status >= 500 ? 502 : res.status,
        );
      }
      return JSON.parse(body);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`OSRM request failed: ${err.message}`);
      throw new HttpException('Failed to reach OSRM', 502);
    }
  }

  @Get('route')
  @ApiOperation({ summary: 'Proxy a OSRM /route (geometria de la ruta)' })
  @ApiQuery({ name: 'coords', example: '-74.072,4.711;-74.090,4.681' })
  @ApiQuery({ name: 'overview', required: false, example: 'full' })
  @ApiQuery({ name: 'geometries', required: false, example: 'geojson' })
  @ApiResponse({ status: 200, description: 'Respuesta cruda de OSRM' })
  async route(
    @Query('coords') coords: string,
    @Query('overview') overview = 'full',
    @Query('geometries') geometries = 'geojson',
  ) {
    this.validateCoords(coords);
    const url = `${this.OSRM_BASE}/route/v1/driving/${coords}?overview=${encodeURIComponent(overview)}&geometries=${encodeURIComponent(geometries)}`;
    return this.forwardToOsrm(url);
  }

  @Get('table')
  @ApiOperation({ summary: 'Proxy a OSRM /table (matriz distancia/duracion)' })
  @ApiQuery({ name: 'coords', example: '-74.072,4.711;-74.090,4.681;-74.091,4.681' })
  @ApiQuery({ name: 'annotations', required: false, example: 'distance,duration' })
  @ApiResponse({ status: 200, description: 'Respuesta cruda de OSRM' })
  async table(
    @Query('coords') coords: string,
    @Query('annotations') annotations = 'distance,duration',
  ) {
    this.validateCoords(coords);
    const url = `${this.OSRM_BASE}/table/v1/driving/${coords}?annotations=${encodeURIComponent(annotations)}`;
    return this.forwardToOsrm(url);
  }
}
