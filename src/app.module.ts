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
import { CompanyModule } from './modules/company/company.module';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    CommonModule,
    AuthModule,
    UsersModule,
    DriversModule,
    VehiclesModule,
    RoutesModule,
    RoleModule,
    CredentialsModule,
    CompanyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({
        path: 'users',
        method: RequestMethod.ALL,
      }, {
        path: 'roles',
        method: RequestMethod.ALL,
      }, {
        path: 'credentials',
        method: RequestMethod.ALL,
      }, {
        path: 'routes',
        method: RequestMethod.ALL,
      }, {
        path: 'company',
        method: RequestMethod.ALL,
      }, {
        path: 'vehicles',
        method: RequestMethod.ALL,
      }, {
        path: 'drivers',
        method: RequestMethod.ALL,
      }, {
        path: 'auth',
        method: RequestMethod.ALL,
      }
    );
  }
}