import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { JobsService } from '../jobs/jobs.service';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly storageService: StorageService,
    @InjectQueue('image-processing') private readonly queue: Queue,
  ) {}

  async handleUpload(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const jobId = randomUUID();
    const extension = file.originalname.split('.').pop() || 'bin';
    const originalKey = `originals/${jobId}.${extension}`;

    try {
      // 1. Upload original file to storage
      await this.storageService.uploadFile(originalKey, file.buffer, file.mimetype);

      // 2. Create database job record
      await this.jobsService.create({
        id: jobId,
        status: 'pending',
        originalName: file.originalname,
        originalPath: originalKey,
        processedPath: null,
        error: null,
      });

      // 3. Enqueue job into BullMQ
      await this.queue.add(
        'process-image',
        {
          jobId,
          originalPath: originalKey,
          originalName: file.originalname,
        },
        {
          jobId, // Set BullMQ job ID equal to database job ID
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );

      this.logger.log(`Created job ${jobId} and enqueued for processing`);
      return jobId;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to handle upload for job ${jobId}: ${errMsg}`);
      throw new Error(`Failed to initialize job: ${errMsg}`);
    }
  }
}
