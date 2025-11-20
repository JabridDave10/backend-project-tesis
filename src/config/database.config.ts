import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'logistic-routing-project',
  // Cargar todas las entidades automáticamente
  // Usar autoLoadEntities es más confiable que especificar rutas manualmente
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  // Configuraciones adicionales para evitar problemas de conexión
  connectTimeoutMS: 10000,
  extra: {
    max: 10, // máximo de conexiones en el pool
    connectionTimeoutMillis: 10000,
  },
};
