import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { CredentialsService } from '../credentials/credentials.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, CredentialsService],
  exports: [PermissionsService, CredentialsService],
})
export class PermissionsModule {}
