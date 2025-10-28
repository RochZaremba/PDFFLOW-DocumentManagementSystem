import { User } from './user.entity';
import { PdfTag } from './pdf-tag.entity';
export declare enum PdfStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class PdfFile {
    id: string;
    title: string;
    fileUrl: string;
    status: PdfStatus;
    createdAt: Date;
    updatedAt: Date;
    uploadedBy: User;
    uploadedById: string;
    pdfTags: PdfTag[];
}
