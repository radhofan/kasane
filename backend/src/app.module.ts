import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { loadEnv } from './common/env';
import { StorageModule } from './storage/storage.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { UploadModule } from './modules/upload/upload.module';
import { Job } from './modules/jobs/job.entity';

// Load environment variables before initializing decorators/modules
loadEnv();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kasane',
      entities: [Job],
      synchronize: true, // Automatically synchronize table structures in development
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    StorageModule,
    JobsModule,
    UploadModule,
  ],
})
export class AppModule {}
