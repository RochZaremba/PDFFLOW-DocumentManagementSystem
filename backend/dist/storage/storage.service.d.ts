import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private minioClient;
    private bucketName;
    private getRequiredConfig;
    constructor(configService: ConfigService);
    private ensureBucketExists;
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    getFileStream(fileUrl: string): Promise<any>;
}
