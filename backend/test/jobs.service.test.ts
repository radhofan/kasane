import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from '../src/modules/jobs/jobs.service';
import { Job } from '../src/modules/jobs/job.entity';
import { NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let repository: Repository<Job>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    repository = module.get<Repository<Job>>(getRepositoryToken(Job));
  });

  describe('findOne', () => {
    it('should return a job if it exists', async () => {
      const mockJob = { id: 'job-123', status: 'pending' };
      mockRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findOne('job-123');
      expect(result).toEqual(mockJob);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'job-123' } });
    });

    it('should throw NotFoundException if job does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and save a new job', async () => {
      const jobData = { id: 'job-123', status: 'pending' as const };
      mockRepository.create.mockReturnValue(jobData);
      mockRepository.save.mockResolvedValue(jobData);

      const result = await service.create(jobData);
      expect(result).toEqual(jobData);
      expect(repository.create).toHaveBeenCalledWith(jobData);
      expect(repository.save).toHaveBeenCalledWith(jobData);
    });
  });
});
