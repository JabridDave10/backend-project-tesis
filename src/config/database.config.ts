import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'admin',
  database: process.env.DB_NAME || 'logistic_routing_project',
  // Cargar todas las entidades automáticamente usando patrón de glob
  // Funciona tanto en desarrollo (.ts) como en producción (.js)
  entities: [
    join(__dirname, '..', 'modules', '**', 'entities', '*.entity.js'),
    join(__dirname, '..', 'modules', '**', 'entities', '*.entity.ts'),
  ],
  synchronize: true, // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  autoLoadEntities: true, // También activo por si las entidades están registradas en módulos
};
