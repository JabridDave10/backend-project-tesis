import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Credentials } from '../modules/credentials/entities/credentials.entity';
import { Driver } from '../modules/drivers/entities/driver.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Route } from '../modules/routes/entities/route.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { UserRole } from '../modules/roles/entities/user_role';
import { Company } from '../modules/company/entities/company.entity';
import { CompanyUser } from '../modules/company/entities/company_user.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'logistic-routing-project',
  entities: [User, Credentials, Driver, Vehicle, Route, Role, UserRole, Company, CompanyUser],
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  autoLoadEntities: true,
};
