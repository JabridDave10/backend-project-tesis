import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CredentialsService } from '../credentials/credentials.service';
import { StorageModule } from '../storage/storage.module';
import { FileValidationService } from '../../common/services/file-validation.service';

@Module({
  imports: [StorageModule],
  controllers: [UsersController],
  providers: [UsersService, CredentialsService, FileValidationService],
  exports: [UsersService, CredentialsService],
})
export class UsersModule {}
