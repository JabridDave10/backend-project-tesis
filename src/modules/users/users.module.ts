import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CredentialsService } from '../credentials/credentials.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, CredentialsService],
  exports: [UsersService, CredentialsService],
})
export class UsersModule {}
