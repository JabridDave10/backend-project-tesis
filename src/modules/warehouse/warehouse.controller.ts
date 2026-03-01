import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/create-warehouse.dto';

@ApiTags('Warehouse')
@Controller('warehouse')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una bodega' })
  async create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar bodegas' })
  @ApiQuery({ name: 'companyId', required: false })
  async findAll(@Query('companyId') companyId?: string) {
    return this.warehouseService.findAll(
      companyId ? parseInt(companyId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una bodega por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una bodega' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehouseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una bodega (soft delete)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.remove(id);
  }
}
