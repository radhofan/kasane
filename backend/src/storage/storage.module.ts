import { Module, Global } from '@nestjs/common';
import { StorageService, LocalStorageService, SupabaseStorageService } from './storage.service';

@Global()
@Module({
  providers: [
    {
      provide: StorageService,
      useFactory: () => {
        const provider = process.env.STORAGE_PROVIDER || 'local';
        if (provider.toLowerCase() === 'supabase') {
          return new SupabaseStorageService();
        }
        return new LocalStorageService();
      },
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
