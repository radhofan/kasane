import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export abstract class StorageService {
  abstract uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  abstract downloadFile(key: string): Promise<Buffer>;
  abstract deleteFile(key: string): Promise<void>;
}

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseDir: string;

  constructor() {
    super();
    // Resolve the uploads directory relative to project root
    const rawDir = process.env.LOCAL_STORAGE_DIR || './uploads';
    const rootDir = path.resolve(__dirname, '../../..');
    this.baseDir = path.isAbsolute(rawDir) ? rawDir : path.resolve(rootDir, rawDir);
    
    // Ensure base directory exists
    if (!fs.existsSync(this.baseDir)) {
      this.logger.log(`Creating local storage directory at: ${this.baseDir}`);
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
    this.logger.log(`Uploaded file locally: ${key}`);
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
      this.logger.log(`Deleted file locally: ${key}`);
    }
  }
}

@Injectable()
export class SupabaseStorageService extends StorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private supabase: SupabaseClient;
  private bucket: string;

  constructor() {
    super();
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = process.env.SUPABASE_BUCKET || 'kasane-images';

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase URL and Service Role Key must be provided when STORAGE_PROVIDER is supabase');
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    this.logger.log(`Uploaded file to Supabase: ${key}`);
    return data.path;
  }

  async downloadFile(key: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(key);

    if (error) {
      this.logger.error(`Supabase download failed: ${error.message}`);
      throw new Error(`Supabase download failed: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async deleteFile(key: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([key]);

    if (error) {
      this.logger.error(`Supabase delete failed: ${error.message}`);
      throw new Error(`Supabase delete failed: ${error.message}`);
    }

    this.logger.log(`Deleted file from Supabase: ${key}`);
  }
}
