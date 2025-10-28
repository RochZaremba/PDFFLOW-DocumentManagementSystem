import { PdfTag } from './pdf-tag.entity';
export declare class Tag {
    id: string;
    name: string;
    createdAt: Date;
    pdfTags: PdfTag[];
}
