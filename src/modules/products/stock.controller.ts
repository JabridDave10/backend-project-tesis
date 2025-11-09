import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { StockService } from './stock.service';
import { ReserveStockDto } from './dto/stock.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

/**
 * StockController
 *
 * Responsabilidad: Manejar peticiones HTTP relacionadas con inventario y movimientos de stock
 */
@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Obtener stock de un producto en todas las bodegas' })
  @ApiResponse({ status: 200, description: 'Stock del producto por bodega' })
  async getStockByProduct(@Param('productId') productId: string) {
    return await this.stockService.getStockByProduct(+productId);
  }

  @Get('warehouse/:warehouseId')
  @ApiOperation({ summary: 'Obtener todo el stock de una bodega' })
  @ApiResponse({ status: 200, description: 'Inventario completo de la bodega' })
  async getStockByWarehouse(@Param('warehouseId') warehouseId: string) {
    return await this.stockService.getStockByWarehouse(+warehouseId);
  }

  @Get('product/:productId/warehouse/:warehouseId')
  @ApiOperation({ summary: 'Obtener stock de un producto en una bodega específica' })
  @ApiResponse({ status: 200, description: 'Stock del producto en la bodega' })
  @ApiResponse({ status: 404, description: 'Stock no encontrado' })
  async getStock(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return await this.stockService.getStock(+productId, +warehouseId);
  }

  @Get('check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidad de stock' })
  @ApiQuery({ name: 'productId', required: true, description: 'ID del producto' })
  @ApiQuery({ name: 'warehouseId', required: true, description: 'ID de la bodega' })
  @ApiQuery({ name: 'quantity', required: true, description: 'Cantidad requerida' })
  @ApiResponse({ status: 200, description: 'Resultado de disponibilidad' })
  async checkAvailability(
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId: string,
    @Query('quantity') quantity: string,
  ) {
    const available = await this.stockService.checkAvailability(
      +productId,
      +warehouseId,
      +quantity,
    );

    return {
      available,
      productId: +productId,
      warehouseId: +warehouseId,
      requestedQuantity: +quantity,
    };
  }

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reservar stock para una ruta' })
  @ApiResponse({ status: 200, description: 'Stock reservado exitosamente' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente' })
  @ApiResponse({ status: 404, description: 'Stock no encontrado' })
  async reserveStock(@Body() reserveDto: ReserveStockDto) {
    const stock = await this.stockService.reserveStock(reserveDto);
    return {
      message: 'Stock reservado exitosamente',
      data: stock,
    };
  }

  @Post('release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liberar stock reservado (cancelar reserva)' })
  @ApiResponse({ status: 200, description: 'Stock liberado exitosamente' })
  async releaseReservedStock(
    @Body()
    body: {
      productId: number;
      warehouseId: number;
      quantity: number;
      userId: number;
    },
  ) {
    const stock = await this.stockService.releaseReservedStock(
      body.productId,
      body.warehouseId,
      body.quantity,
      body.userId,
    );
    return {
      message: 'Stock liberado exitosamente',
      data: stock,
    };
  }

  @Post('movements/entry')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar entrada de stock (compra, devolución)' })
  @ApiResponse({ status: 201, description: 'Entrada registrada exitosamente' })
  async addStock(@Body() movementDto: CreateStockMovementDto) {
    const stock = await this.stockService.addStock(movementDto);
    return {
      message: 'Entrada de stock registrada exitosamente',
      data: stock,
    };
  }

  @Post('movements/exit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar salida de stock (venta, despacho, baja)' })
  @ApiResponse({ status: 200, description: 'Salida registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente' })
  async removeStock(@Body() movementDto: CreateStockMovementDto) {
    const stock = await this.stockService.removeStock(movementDto);
    return {
      message: 'Salida de stock registrada exitosamente',
      data: stock,
    };
  }

  @Get('movements/product/:productId')
  @ApiOperation({ summary: 'Obtener historial de movimientos de un producto' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de registros (default: 50)',
  })
  @ApiResponse({ status: 200, description: 'Historial de movimientos' })
  async getMovementHistory(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    return await this.stockService.getMovementHistory(
      +productId,
      limit ? +limit : 50,
    );
  }
}
