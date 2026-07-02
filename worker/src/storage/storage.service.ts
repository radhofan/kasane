import * as fs from 'fs';
import * as path from 'path';

export abstract class StorageService {
  abstract uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  abstract downloadFile(key: string): Promise<Buffer>;
  abstract deleteFile(key: string): Promise<void>;
}

export class LocalStorageService extends StorageService {
  private readonly baseDir: string;

  constructor() {
    super();
    const rawDir = process.env.LOCAL_STORAGE_DIR || './uploads';
    const rootDir = path.resolve(__dirname, '../../..');
    this.baseDir = path.isAbsolute(rawDir) ? rawDir : path.resolve(rootDir, rawDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const filePath = path.join(this.baseDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, buffer);
    return key;
  }

  async downloadFile(key: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found in local storage: ${key}`);
    }
    return fs.promises.readFile(filePath);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

export function getStorageService(): StorageService {
  return new LocalStorageService();
}
