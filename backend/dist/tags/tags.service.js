"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tag_entity_1 = require("../entities/tag.entity");
const pdf_tag_entity_1 = require("../entities/pdf-tag.entity");
const pdf_file_entity_1 = require("../entities/pdf-file.entity");
let TagsService = class TagsService {
    tagRepository;
    pdfTagRepository;
    pdfRepository;
    constructor(tagRepository, pdfTagRepository, pdfRepository) {
        this.tagRepository = tagRepository;
        this.pdfTagRepository = pdfTagRepository;
        this.pdfRepository = pdfRepository;
    }
    async getAllTags() {
        return this.tagRepository.find({
            order: { name: 'ASC' },
        });
    }
    async createTag(createTagDto) {
        const { name } = createTagDto;
        const existingTag = await this.tagRepository.findOne({
            where: { name },
        });
        if (existingTag) {
            throw new common_1.ConflictException(`Tag "${name}" już istnieje`);
        }
        const tag = this.tagRepository.create({ name });
        await this.tagRepository.save(tag);
        console.log(`✅ Tag created: ${tag.name}`);
        return tag;
    }
    async findOrCreateTag(tagName) {
        const normalizedName = tagName.trim().toLowerCase();
        let tag = await this.tagRepository.findOne({
            where: { name: normalizedName },
        });
        if (!tag) {
            tag = this.tagRepository.create({ name: normalizedName });
            await this.tagRepository.save(tag);
            console.log(`✅ Tag auto-created: ${tag.name}`);
        }
        return tag;
    }
    async assignTagsToPdf(pdfId, assignTagsDto) {
        const { tagNames } = assignTagsDto;
        let pdf = await this.pdfRepository.findOne({
            where: { id: pdfId },
            relations: ['pdfTags', 'pdfTags.tag'],
        });
        if (!pdf) {
            throw new common_1.NotFoundException(`Plik PDF o ID ${pdfId} nie został znaleziony`);
        }
        if (pdf.pdfTags.length > 0) {
            await this.pdfTagRepository.remove(pdf.pdfTags);
        }
        const tags = await Promise.all(tagNames.map(tagName => this.findOrCreateTag(tagName)));
        const pdfTags = tags.map(tag => {
            return this.pdfTagRepository.create({
                pdfFile: pdf,
                tag,
            });
        });
        await this.pdfTagRepository.save(pdfTags);
        console.log(`✅ Tags assigned to PDF ${pdf.title}: ${tagNames.join(', ')}`);
        const updatedPdf = await this.pdfRepository.findOne({
            where: { id: pdfId },
            relations: ['pdfTags', 'pdfTags.tag', 'uploadedBy'],
        });
        if (!updatedPdf) {
            throw new common_1.NotFoundException(`Wystąpił błąd podczas pobierania zaktualizowanego pliku PDF o ID ${pdfId}`);
        }
        return updatedPdf;
    }
    async addTagsToPdf(pdfId, assignTagsDto) {
        let pdf = await this.pdfRepository.findOne({
            where: { id: pdfId },
            relations: ['pdfTags', 'pdfTags.tag'],
        });
        if (!pdf) {
            throw new common_1.NotFoundException(`Plik PDF o ID ${pdfId} nie został znaleziony`);
        }
        const { tagNames } = assignTagsDto;
        const existingTagNames = pdf.pdfTags.map(pt => pt.tag.name);
        const newTagNames = tagNames.filter(tagName => !existingTagNames.includes(tagName.trim().toLowerCase()));
        if (newTagNames.length === 0) {
            console.log(`⚠️ Wszystkie tagi już są przypisane do PDF ${pdf.title}`);
            return pdf;
        }
        const tags = await Promise.all(newTagNames.map(tagName => this.findOrCreateTag(tagName)));
        const pdfTags = tags.map(tag => {
            return this.pdfTagRepository.create({
                pdfFile: pdf,
                tag,
            });
        });
        await this.pdfTagRepository.save(pdfTags);
        console.log(`✅ Tags added to PDF ${pdf.title}: ${newTagNames.join(', ')}`);
        const updatedPdf = await this.pdfRepository.findOne({
            where: { id: pdfId },
            relations: ['pdfTags', 'pdfTags.tag', 'uploadedBy'],
        });
        if (!updatedPdf) {
            throw new common_1.NotFoundException(`Wystąpił błąd podczas pobierania zaktualizowanego pliku PDF o ID ${pdfId}`);
        }
        return updatedPdf;
    }
    async removeTagFromPdf(pdfId, tagId) {
        const pdfTag = await this.pdfTagRepository.findOne({
            where: {
                pdfFile: { id: pdfId },
                tag: { id: tagId },
            },
            relations: ['pdfFile', 'tag'],
        });
        if (!pdfTag) {
            throw new common_1.NotFoundException(`Powiązanie między PDF ${pdfId} a Tag ${tagId} nie istnieje`);
        }
        await this.pdfTagRepository.remove(pdfTag);
        console.log(`✅ Tag ${pdfTag.tag.name} removed from PDF ${pdfTag.pdfFile.title}`);
        const updatedPdf = await this.pdfRepository.findOne({
            where: { id: pdfId },
            relations: ['pdfTags', 'pdfTags.tag', 'uploadedBy'],
        });
        if (!updatedPdf) {
            throw new common_1.NotFoundException(`Wystąpił błąd podczas pobierania zaktualizowanego pliku PDF o ID ${pdfId}`);
        }
        return updatedPdf;
    }
    async getPdfTags(pdfId) {
        const pdf = await this.pdfRepository.findOne({
            where: { id: pdfId },
            relations: ['pdfTags', 'pdfTags.tag'],
        });
        if (!pdf) {
            throw new common_1.NotFoundException(`Plik PDF o ID ${pdfId} nie został znaleziony`);
        }
        return pdf.pdfTags.map(pt => pt.tag);
    }
    async deleteTag(tagId) {
        const tag = await this.tagRepository.findOne({
            where: { id: tagId },
        });
        if (!tag) {
            throw new common_1.NotFoundException(`Tag o ID ${tagId} nie został znaleziony`);
        }
        await this.tagRepository.remove(tag);
        console.log(`✅ Tag deleted: ${tag.name} (usunięty ze wszystkich PDF-ów)`);
    }
    async getTagStats() {
        const tags = await this.tagRepository
            .createQueryBuilder('tag')
            .leftJoin('tag.pdfTags', 'pdfTag')
            .select('tag')
            .addSelect('COUNT(pdfTag.id)', 'count')
            .groupBy('tag.id')
            .orderBy('count', 'DESC')
            .getRawAndEntities();
        return tags.entities.map((tag, index) => ({
            tag,
            count: parseInt(tags.raw[index].count, 10),
        }));
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(1, (0, typeorm_1.InjectRepository)(pdf_tag_entity_1.PdfTag)),
    __param(2, (0, typeorm_1.InjectRepository)(pdf_file_entity_1.PdfFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TagsService);
//# sourceMappingURL=tags.service.js.map