import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { CredentialsService } from '../credentials/credentials.service';
import { Permissions } from './entities/permissions.entity';
import { RolePermissions } from './entities/role_permissions';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions, RolePermissions])],
  controllers: [PermissionsController],
  providers: [PermissionsService, CredentialsService],
  exports: [PermissionsService, CredentialsService],
})
export class PermissionsModule {}
