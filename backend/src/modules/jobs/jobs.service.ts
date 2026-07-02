import { Injectable, NotFoundException, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Job } from './job.entity';

@Injectable()
export class JobsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Running startup sweep to clean up stalled jobs...');
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await this.jobRepository.update(
        {
          status: In(['pending', 'processing']),
          updatedAt: LessThan(fiveMinutesAgo),
        },
        {
          status: 'failed',
          error: 'Job stalled due to worker crash or timeout',
          updatedAt: new Date(),
        }
      );
      if (result.affected && result.affected > 0) {
        this.logger.warn(`Swept and failed ${result.affected} stalled jobs that exceeded 5 minutes.`);
      } else {
        this.logger.log('No stalled jobs found to sweep.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to run startup jobs sweep: ${errMsg}`);
    }
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async create(jobData: Partial<Job>): Promise<Job> {
    const job = this.jobRepository.create(jobData);
    return this.jobRepository.save(job);
  }
}
