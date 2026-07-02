import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from '../src/modules/upload/upload.controller';
import { UploadService } from '../src/modules/upload/upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  beforeEach(async () => {
    const mockUploadService = {
      handleUpload: jest.fn().mockResolvedValue('test-job-uuid'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);
  });

  const createMockFile = (size: number, mimetype: string, originalname: string): Express.Multer.File => {
    return {
      fieldname: 'file',
      originalname,
      encoding: '7bit',
      mimetype,
      size,
      buffer: Buffer.from('test-image'),
    } as unknown as Express.Multer.File;
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should successfully upload a valid image file and return jobId', async () => {
      const file = createMockFile(1024, 'image/jpeg', 'test.jpg');
      const result = await controller.uploadFile(file);

      expect(result).toEqual({ jobId: 'test-job-uuid' });
      expect(uploadService.handleUpload).toHaveBeenCalledWith(file);
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(controller.uploadFile(null as unknown as Express.Multer.File)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file size exceeds 20MB', async () => {
      const hugeFile = createMockFile(21 * 1024 * 1024, 'image/png', 'huge.png');
      await expect(controller.uploadFile(hugeFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if mime-type is invalid', async () => {
      const badFile = createMockFile(1024, 'text/plain', 'notes.txt');
      await expect(controller.uploadFile(badFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
