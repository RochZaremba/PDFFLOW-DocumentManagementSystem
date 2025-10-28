import { PdfService } from './pdf.service';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryPdfDto } from './dto/query-pdf.dto';
export declare class PdfController {
    private readonly pdfService;
    constructor(pdfService: PdfService);
    uploadPdf(uploadPdfDto: UploadPdfDto, file: Express.Multer.File, req: any): Promise<{
        message: string;
        pdf: import("../entities").PdfFile;
    }>;
    getApprovedPdfs(queryDto: QueryPdfDto): Promise<{
        data: import("../entities").PdfFile[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPendingPdfs(): Promise<{
        data: import("../entities").PdfFile[];
        count: number;
    }>;
    getMyPdfs(req: any): Promise<{
        data: import("../entities").PdfFile[];
        count: number;
    }>;
    getPdfById(id: string): Promise<import("../entities").PdfFile>;
    updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<{
        message: string;
        pdf: import("../entities").PdfFile;
    }>;
    deletePdf(id: string, req: any): Promise<{
        message: string;
    }>;
}
