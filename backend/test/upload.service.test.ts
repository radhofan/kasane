import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from '../src/modules/upload/upload.service';
import { JobsService } from '../src/modules/jobs/jobs.service';
import { StorageService } from '../src/storage/storage.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('UploadService', () => {
  let service: UploadService;
  let jobsService: JobsService;
  let storageService: StorageService;
  let mockQueue: { add: jest.Mock };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'bullmq-job-id' }),
    };

    const mockJobsService = {
      create: jest.fn().mockResolvedValue({}),
    };

    const mockStorageService = {
      uploadFile: jest.fn().mockResolvedValue('key-path'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: getQueueToken('image-processing'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    jobsService = module.get<JobsService>(JobsService);
    storageService = module.get<StorageService>(StorageService);
  });

  const createMockFile = (): Express.Multer.File => {
    return {
      fieldname: 'file',
      originalname: 'photo.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 500,
      buffer: Buffer.from('photo-bytes'),
    } as unknown as Express.Multer.File;
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleUpload', () => {
    it('should successfully store the file, create a pending job in DB, and queue in BullMQ', async () => {
      const file = createMockFile();
      const jobId = await service.handleUpload(file);

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      // Verify original file is uploaded
      expect(storageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining(`originals/${jobId}`),
        file.buffer,
        file.mimetype,
      );

      // Verify db job record is initialized as pending
      expect(jobsService.create).toHaveBeenCalledWith({
        id: jobId,
        status: 'pending',
        originalName: file.originalname,
        originalPath: expect.stringContaining(jobId),
        processedPath: null,
        error: null,
      });

      // Verify job is enqueued in BullMQ
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-image',
        expect.objectContaining({ jobId }),
        expect.objectContaining({ jobId }),
      );
    });

    it('should propagate error if storage upload fails', async () => {
      const file = createMockFile();
      jest.spyOn(storageService, 'uploadFile').mockRejectedValue(new Error('Storage failure'));

      await expect(service.handleUpload(file)).rejects.toThrow('Failed to initialize job: Storage failure');
    });
  });
});
