import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CredentialsService } from '../credentials/credentials.service';
import { StorageModule } from '../storage/storage.module';
import { FileValidationService } from '../../common/services/file-validation.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, CredentialsService, FileValidationService],
  exports: [UsersService, CredentialsService],
})
export class UsersModule {}
