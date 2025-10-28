import { Repository } from 'typeorm';
import { PdfFile } from '../entities/pdf-file.entity';
import { User } from '../entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryPdfDto } from './dto/query-pdf.dto';
export declare class PdfService {
    private pdfRepository;
    private storageService;
    constructor(pdfRepository: Repository<PdfFile>, storageService: StorageService);
    uploadPdf(uploadPdfDto: UploadPdfDto, file: Express.Multer.File, user: User): Promise<PdfFile>;
    getApprovedPdfs(queryDto: QueryPdfDto): Promise<{
        data: PdfFile[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPendingPdfs(): Promise<PdfFile[]>;
    getPdfById(id: string): Promise<PdfFile>;
    updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<PdfFile>;
    deletePdf(id: string, user: User): Promise<void>;
    getUserPdfs(userId: string): Promise<PdfFile[]>;
}
