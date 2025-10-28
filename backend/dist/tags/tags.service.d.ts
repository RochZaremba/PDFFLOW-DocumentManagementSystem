import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { PdfTag } from '../entities/pdf-tag.entity';
import { PdfFile } from '../entities/pdf-file.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';
export declare class TagsService {
    private tagRepository;
    private pdfTagRepository;
    private pdfRepository;
    constructor(tagRepository: Repository<Tag>, pdfTagRepository: Repository<PdfTag>, pdfRepository: Repository<PdfFile>);
    getAllTags(): Promise<Tag[]>;
    createTag(createTagDto: CreateTagDto): Promise<Tag>;
    private findOrCreateTag;
    assignTagsToPdf(pdfId: string, assignTagsDto: AssignTagsDto): Promise<PdfFile>;
    addTagsToPdf(pdfId: string, assignTagsDto: AssignTagsDto): Promise<PdfFile>;
    removeTagFromPdf(pdfId: string, tagId: string): Promise<PdfFile>;
    getPdfTags(pdfId: string): Promise<Tag[]>;
    deleteTag(tagId: string): Promise<void>;
    getTagStats(): Promise<Array<{
        tag: Tag;
        count: number;
    }>>;
}
