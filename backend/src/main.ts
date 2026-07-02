import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './common/env';

// Load environment variables early
loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Cross-Origin Resource Sharing (CORS) for frontend requests
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`NestJS Backend server running on: http://localhost:${port}`);
}
bootstrap();
