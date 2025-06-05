import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from '@/configs/swagger.config';
import { ConfigService } from '@nestjs/config';
import { appConst } from '@/constants/app.constant';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://thuchi-web.vercel.app'], // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-timezone', // Custom timezone header
      'timezone', // Fallback timezone header
      'time-zone', // Alternative timezone header
    ],
  });

  app.setGlobalPrefix(appConst.baseUrl);
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');
  SwaggerModule.setup(appConst.baseUrl + '/document', app, document);
  app.use(helmet());
  await app.listen(port);
}
bootstrap();
