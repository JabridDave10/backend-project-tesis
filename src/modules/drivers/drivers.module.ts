import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { StorageModule } from '../storage/storage.module';
import { DriverQueryBuilder } from './services/driver-query.builder';
import { FileValidationService } from '../../common/services/file-validation.service';
import { Driver } from './entities/driver.entity';
import { DriverCertification } from './entities/driver-certification.entity';
import { DriverWorkExperience } from './entities/driver-work-experience.entity';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([Driver, DriverCertification, DriverWorkExperience]),
  ],
  controllers: [DriversController],
  providers: [DriversService, DriverQueryBuilder, FileValidationService],
  exports: [DriversService],
})
export class DriversModule {}
