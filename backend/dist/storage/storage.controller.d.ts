import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadFile(file: Express.Multer.File): Promise<{
        message: string;
        fileUrl: string;
    }>;
    deleteFile(fileUrl: string): Promise<{
        message: string;
    }>;
}
