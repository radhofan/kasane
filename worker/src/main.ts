import { DataSource } from 'typeorm';
import { Worker, Job as BullJob } from 'bullmq';
import { loadEnv } from './common/env';
import { Job } from './modules/jobs/job.entity';
import { getStorageService } from './storage/storage.service';
import { processImage } from './processors/image.processor';

loadEnv();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kasane',
  entities: [Job],
  synchronize: false, // Database schema synchronization is handled by the backend
});

const storageService = getStorageService();

async function start() {
  // Initialize database connection
  await dataSource.initialize();
  console.log('Worker connected to PostgreSQL database');

  const jobRepository = dataSource.getRepository(Job);

  // Initialize BullMQ connection parameters
  const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  };

  // Initialize BullMQ worker
  const worker = new Worker(
    'image-processing',
    async (bullJob: BullJob) => {
      const { jobId, originalPath } = bullJob.data;
      console.log(`Processing job ${jobId} (Attempt #${bullJob.attemptsMade + 1})`);

      // 1. Update job status to 'processing'
      await jobRepository.update(jobId, {
        status: 'processing',
        updatedAt: new Date(),
      });

      try {
        // 2. Download original image from storage
        console.log(`Downloading original image: ${originalPath}`);
        const originalBuffer = await storageService.downloadFile(originalPath);

        // 3. Process the image
        console.log('Running image transformations (resize, WebP convert, compress)...');
        const processed = await processImage(originalBuffer);

        // 4. Upload processed WebP image back to storage
        const processedKey = `processed/${jobId}.webp`;
        console.log(`Uploading processed WebP: ${processedKey}`);
        await storageService.uploadFile(processedKey, processed.buffer, 'image/webp');

        // 5. Update job status to 'completed' in database
        await jobRepository.update(jobId, {
          status: 'completed',
          processedPath: processedKey,
          error: null,
          updatedAt: new Date(),
        });

        console.log(`Job ${jobId} completed successfully`);
        return { processedPath: processedKey };
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown processing error';
        console.error(`Error processing job ${jobId}: ${errMsg}`);

        // Update database with failure status and error details
        await jobRepository.update(jobId, {
          status: 'failed',
          error: errMsg,
          updatedAt: new Date(),
        });

        throw error; // Re-throw to let BullMQ handle retry/fail state
      }
    },
    {
      connection,
      concurrency: 2, // Process up to 2 jobs concurrently
    }
  );

  worker.on('active', (job) => {
    console.log(`Job ${job.id} has started processing`);
  });

  worker.on('failed', (job, err) => {
    console.warn(`Job ${job?.id} failed with error: ${err.message}`);
  });

  worker.on('error', (err) => {
    console.error(`Worker connection error: ${err.message}`);
  });

  console.log('BullMQ Worker is running and waiting for jobs...');

  // Graceful shutdown handling (Option A)
  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    console.log('Closing BullMQ worker (waiting for active jobs to complete)...');
    try {
      // Closes the worker, refusing new jobs and waiting for active ones to finish
      await worker.close();
      console.log('BullMQ worker closed.');
    } catch (err: unknown) {
      console.error('Error closing BullMQ worker:', err);
    }

    console.log('Closing database connection...');
    try {
      await dataSource.destroy();
      console.log('Database connection closed.');
    } catch (err: unknown) {
      console.error('Error closing database connection:', err);
    }

    console.log('Graceful shutdown complete. Exiting.');
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM').catch((err) => {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    });
  });

  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT').catch((err) => {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    });
  });
}

start().catch((err) => {
  console.error('Failed to start worker:', err);
  process.exit(1);
});
