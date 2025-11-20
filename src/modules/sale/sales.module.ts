import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { AuthModule } from '../auth/auth.module';
import { Sales } from './entities/sales.entity';
import { SalesDetail } from './entities/sales_detail.entity';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Sales, SalesDetail]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
