import { Module, Global } from '@nestjs/common';
import { StorageService, LocalStorageService } from './storage.service';

@Global()
@Module({
  providers: [
    {
      provide: StorageService,
      useClass: LocalStorageService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
