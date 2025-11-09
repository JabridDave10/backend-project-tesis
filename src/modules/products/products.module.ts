import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StorageModule } from '../storage/storage.module';
import { FileValidationService } from '../../common/services/file-validation.service';

/**
 * ProductsModule
 *
 * Módulo completo para gestión de productos, categorías y stock
 * Soporte multi-tenant con configuración flexible por compañía
 */
@Module({
  imports: [StorageModule],
  controllers: [
    ProductsController,
    ProductCategoriesController,
    StockController,
  ],
  providers: [
    ProductsService,
    ProductCategoriesService,
    StockService,
    FileValidationService,
  ],
  exports: [
    ProductsService,
    ProductCategoriesService,
    StockService,
  ],
})
export class ProductsModule {}
