import { User } from './user.model';
import { Tag } from './tag.model';

export enum PdfStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface PdfFile {
  id: string;
  title: string;
  fileUrl: string;
  status: PdfStatus;
  createdAt: string;
  updatedAt: string;
  uploadedBy: User;
  uploadedById: string;
  pdfTags?: PdfTag[];
}

export interface PdfTag {
  id: string;
  tag: Tag;
  createdAt: string;
}

export interface PdfListResponse {
  data: PdfFile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UploadPdfRequest {
  title: string;
  file: File;
}
