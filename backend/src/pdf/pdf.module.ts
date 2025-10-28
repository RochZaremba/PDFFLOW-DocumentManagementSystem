import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PdfFile } from '../entities/pdf-file.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PdfFile]),
    StorageModule, // importujemy StorageModule, żeby używać StorageService
  ],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService], // eksportujemy na wypadek użycia w innych modułach
})
export class PdfModule {}
