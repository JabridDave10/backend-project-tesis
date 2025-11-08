import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { RoleModule } from './modules/roles/role.module';
import { RoutesModule } from './modules/routes/routes.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { StorageModule } from './modules/storage/storage.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      
    }),
    TypeOrmModule.forRoot(databaseConfig),
    StorageModule,
    AuthModule,
    UsersModule,
    DriversModule,
    VehiclesModule,
    RoutesModule,
    RoleModule,
    CredentialsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({
        path: 'users/register',
        method: RequestMethod.POST,
      }, {
        path: 'roles/create',
        method: RequestMethod.POST,
      }, {
        path: 'credentials/create',
        method: RequestMethod.POST,
      }, {
        path: 'routes/create',
        method: RequestMethod.POST,
      });
  }
}