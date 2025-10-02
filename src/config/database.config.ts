import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Credentials } from '../modules/users/entities/credentials.entity';
import { Driver } from '../modules/drivers/entities/driver.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Route } from '../modules/routes/entities/route.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'logistic_routing_project',
  entities: [User, Credentials, Driver, Vehicle, Route],
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  autoLoadEntities: true,
};
