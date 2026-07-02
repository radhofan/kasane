import { Controller, Get, Param, Res } from '@nestjs/common';
import * as express from 'express';
import { JobsService } from './jobs.service';
import { StorageService } from '../../storage/storage.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly storageService: StorageService,
  ) {}

  @Get(':id')
  async getJob(@Param('id') id: string) {
    const job = await this.jobsService.findOne(id);
    return {
      id: job.id,
      status: job.status,
      originalName: job.originalName,
      originalPath: job.originalPath,
      processedPath: job.processedPath,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  @Get(':id/download')
  async downloadJob(@Param('id') id: string, @Res() res: express.Response) {
    const job = await this.jobsService.findOne(id);
    if (job.status !== 'completed' || !job.processedPath) {
      return res.status(400).json({ error: 'Job is not completed or has no processed image' });
    }

    try {
      const buffer = await this.storageService.downloadFile(job.processedPath);
      
      res.setHeader('Content-Type', 'image/webp');
      // Set attachment disposition with original filename but changing extension to .webp
      const baseName = job.originalName.replace(/\.[^/.]+$/, '');
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}_processed.webp"`);
      return res.send(buffer);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ error: `Failed to download file from storage: ${errMsg}` });
    }
  }
}
