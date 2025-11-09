import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductCategoriesService } from './product-categories.service';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/create-product-category.dto';

/**
 * ProductCategoriesController
 *
 * Responsabilidad: Manejar peticiones HTTP relacionadas con categorías de productos
 */
@ApiTags('product-categories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly categoriesService: ProductCategoriesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva categoría de producto' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Categoría ya existe' })
  async create(@Body() createCategoryDto: CreateProductCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: 'Categoría creada exitosamente',
      data: category,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías de productos' })
  @ApiQuery({
    name: 'companyId',
    required: false,
    description: 'Filtrar por ID de compañía',
  })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  async findAll(@Query('companyId') companyId?: string) {
    return await this.categoriesService.findAll(
      companyId ? +companyId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({ status: 200, description: 'Datos de la categoría' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async findOne(@Param('id') id: string) {
    return await this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 409, description: 'Nombre de categoría ya existe' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateProductCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      +id,
      updateCategoryDto,
    );
    return {
      message: 'Categoría actualizada exitosamente',
      data: category,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoría (soft delete)' })
  @ApiResponse({ status: 204, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar (tiene productos asociados)',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(+id);
  }
}
