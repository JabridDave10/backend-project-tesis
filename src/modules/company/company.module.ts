import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { AuthModule } from '../auth/auth.module';
import { Company } from './entities/company.entity';
import { CompanyUser } from './entities/company_user.entity';
import { CompanySettings } from './entities/company-settings.entity';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Company, CompanyUser, CompanySettings]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
