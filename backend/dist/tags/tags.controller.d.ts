import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    getAllTags(): Promise<{
        data: import("../entities").Tag[];
        count: number;
    }>;
    getTagStats(): Promise<{
        tag: import("../entities").Tag;
        count: number;
    }[]>;
    createTag(createTagDto: CreateTagDto): Promise<{
        message: string;
        tag: import("../entities").Tag;
    }>;
    deleteTag(id: string): Promise<{
        message: string;
    }>;
    getPdfTags(pdfId: string): Promise<{
        data: import("../entities").Tag[];
        count: number;
    }>;
    assignTagsToPdf(pdfId: string, assignTagsDto: AssignTagsDto): Promise<{
        message: string;
        pdf: import("../entities").PdfFile;
    }>;
    addTagsToPdf(pdfId: string, assignTagsDto: AssignTagsDto): Promise<{
        message: string;
        pdf: import("../entities").PdfFile;
    }>;
    removeTagFromPdf(pdfId: string, tagId: string): Promise<{
        message: string;
        pdf: import("../entities").PdfFile;
    }>;
}
