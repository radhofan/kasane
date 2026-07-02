import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    // Register the image processing queue
    BullModule.registerQueue({
      name: 'image-processing',
    }),
    JobsModule,
  ],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
