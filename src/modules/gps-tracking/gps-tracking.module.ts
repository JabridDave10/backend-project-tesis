import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverLocation } from './entities/driver-location.entity';
import { GpsTrackingService } from './gps-tracking.service';
import { GpsTrackingGateway } from './gps-tracking.gateway';
import { GpsTrackingController } from './gps-tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DriverLocation])],
  controllers: [GpsTrackingController],
  providers: [GpsTrackingService, GpsTrackingGateway],
  exports: [GpsTrackingService],
})
export class GpsTrackingModule {}
