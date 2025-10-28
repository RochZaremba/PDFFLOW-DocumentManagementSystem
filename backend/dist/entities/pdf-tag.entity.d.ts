import { PdfFile } from './pdf-file.entity';
import { Tag } from './tag.entity';
export declare class PdfTag {
    id: string;
    pdfFile: PdfFile;
    tag: Tag;
    createdAt: Date;
}
