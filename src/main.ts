import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar cookie parser
  app.use(cookieParser());
  
  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Habilitar CORS con configuración para cookies
  app.enableCors({
    origin: true,
    credentials: true, // Importante para cookies
  });
  
  const config = new DocumentBuilder()
    .setTitle('Logistic Routing Project API')
    .setDescription('API para el sistema de gestión de rutas logísticas, conductores, vehículos y rutas')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('drivers', 'Gestión de conductores')
    .addTag('vehicles', 'Gestión de vehículos')
    .addTag('routes', 'Gestión de rutas')
    .addTag('roles', 'Gestión de roles')
    .addTag('credentials', 'Gestión de credenciales')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
