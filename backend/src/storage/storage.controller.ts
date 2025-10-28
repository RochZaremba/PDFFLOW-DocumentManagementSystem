import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nie przesłano pliku');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Można przesyłać tylko pliki PDF');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Plik jest za duży (max 10MB)');
    }

    const fileUrl = await this.storageService.uploadFile(file);

    return {
      message: 'Plik został przesłany pomyślnie',
      fileUrl,
    };
  }

  // ✅ TEST: Usunięcie pliku
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Body('fileUrl') fileUrl: string) {
    if (!fileUrl) {
      throw new BadRequestException('Nie podano URL pliku');
    }

    await this.storageService.deleteFile(fileUrl);

    return {
      message: 'Plik został usunięty',
    };
  }
}
