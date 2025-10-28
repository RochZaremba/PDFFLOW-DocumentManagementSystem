import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private minioClient: Minio.Client;
  private bucketName: string;
  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (value === undefined) {
      throw new InternalServerErrorException(`Krytyczny błąd: Wymagana zmienna konfiguracyjna "${key}" nie jest ustawiona.`);
    }
    return value;
  }
  constructor(private configService: ConfigService) {
    // Inicjalizacja klienta MinIO
    this.minioClient = new Minio.Client({
      endPoint: this.getRequiredConfig('MINIO_ENDPOINT'),
      port: parseInt(this.getRequiredConfig('MINIO_PORT'), 10),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.getRequiredConfig('MINIO_ACCESS_KEY'),
      secretKey: this.getRequiredConfig('MINIO_SECRET_KEY'),
    });

    this.bucketName = this.getRequiredConfig('MINIO_BUCKET_NAME');
    this.ensureBucketExists();
  }

  // Sprawdź, czy bucket istnieje, jeśli nie - utwórz
  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`✅ Bucket "${this.bucketName}" został utworzony`);
      }
    } catch (error) {
      console.error('❌ Błąd podczas sprawdzania/tworzenia bucketa:', error);
    }
  }

  /**
   * Upload pliku do MinIO
   * @param file - plik z Multer (Express.Multer.File)
   * @returns URL do pliku
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      // Wygeneruj unikalną nazwę pliku
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;

      // Metadata (opcjonalnie)
      const metaData = {
        'Content-Type': file.mimetype,
        'Original-Name': Buffer.from(file.originalname).toString('base64'), // kodujemy dla bezpieczeństwa
      };

      // Upload do MinIO
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        metaData,
      );

      // Zwróć URL do pliku
      const fileUrl = `http://${this.configService.get<string>('MINIO_ENDPOINT')}:${this.configService.get<string>('MINIO_PORT')}/${this.bucketName}/${fileName}`;
      
      console.log(`✅ Plik uploaded: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('❌ Błąd podczas uploadu pliku:', error);
      throw new InternalServerErrorException('Nie udało się przesłać pliku');
    }
  }

  /**
   * Usunięcie pliku z MinIO
   * @param fileUrl - pełny URL do pliku
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = fileUrl.split('/').pop();
  
      if (!fileName) {
        throw new InternalServerErrorException('Nieprawidłowy URL pliku. Nie udało się wyodrębnić nazwy pliku.');
      }
  
      await this.minioClient.removeObject(this.bucketName, fileName);
      console.log(`✅ Plik usunięty: ${fileName}`);
    } catch (error) {
      console.error('❌ Błąd podczas usuwania pliku:', error);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Nie udało się usunąć pliku');
    }
  }
    /**
   * Pobierz plik jako stream (opcjonalnie, jeśli potrzebujesz serwować pliki przez backend)
   */
  async getFileStream(fileUrl: string): Promise<any> {
    try {
      const fileName = fileUrl.split('/').pop();
  
      if (!fileName) {
        throw new InternalServerErrorException('Nieprawidłowy URL pliku. Nie udało się wyodrębnić nazwy pliku.');
      }
  
      return await this.minioClient.getObject(this.bucketName, fileName);
    } catch (error) {
      console.error('❌ Błąd podczas pobierania pliku:', error);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Nie udało się pobrać pliku');
    }
  }}
