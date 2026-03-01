import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { LicenseVehicleValidatorService } from './license-vehicle-validator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehiclesController],
  providers: [VehiclesService, LicenseVehicleValidatorService],
  exports: [VehiclesService, LicenseVehicleValidatorService],
})
export class VehiclesModule {}
