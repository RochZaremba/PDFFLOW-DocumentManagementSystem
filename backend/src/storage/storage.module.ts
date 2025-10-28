import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  providers: [StorageService],
  exports: [StorageService],
  controllers: [StorageController], // eksportujemy, żeby inne moduły mogły używać
})
export class StorageModule {}
