import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StorageModule } from '../storage/storage.module';
import { FileValidationService } from '../../common/services/file-validation.service';

// Importar entidades
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { Stock } from './entities/stock.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { ProductBatch } from './entities/product-batch.entity';
import { RouteProduct } from './entities/route-product.entity';
import { CompanySettings } from '../company/entities/company-settings.entity';

/**
 * ProductsModule
 *
 * Módulo completo para gestión de productos, categorías y stock
 * Soporte multi-tenant con configuración flexible por compañía
 */
@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      Stock,
      StockMovement,
      ProductBatch,
      RouteProduct,
      CompanySettings,
    ]),
  ],
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
