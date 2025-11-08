import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { StorageModule } from '../storage/storage.module';
import { DriverQueryBuilder } from './services/driver-query.builder';
import { FileValidationService } from '../../common/services/file-validation.service';

@Module({
  imports: [StorageModule],
  controllers: [DriversController],
  providers: [DriversService, DriverQueryBuilder, FileValidationService],
  exports: [DriversService],
})
export class DriversModule {}
