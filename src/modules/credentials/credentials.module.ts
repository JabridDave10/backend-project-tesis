import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { Credentials } from './entities/credentials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credentials])],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
