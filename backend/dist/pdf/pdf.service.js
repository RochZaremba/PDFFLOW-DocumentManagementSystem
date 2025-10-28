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
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pdf_file_entity_1 = require("../entities/pdf-file.entity");
const storage_service_1 = require("../storage/storage.service");
let PdfService = class PdfService {
    pdfRepository;
    storageService;
    constructor(pdfRepository, storageService) {
        this.pdfRepository = pdfRepository;
        this.storageService = storageService;
    }
    async uploadPdf(uploadPdfDto, file, user) {
        const fileUrl = await this.storageService.uploadFile(file);
        const pdfFile = this.pdfRepository.create({
            title: uploadPdfDto.title,
            fileUrl,
            status: pdf_file_entity_1.PdfStatus.PENDING,
            uploadedById: user.id,
        });
        await this.pdfRepository.save(pdfFile);
        console.log(`✅ PDF uploaded: ${pdfFile.title} (ID: ${pdfFile.id})`);
        return pdfFile;
    }
    async getApprovedPdfs(queryDto) {
        const { search, tags, page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = queryDto;
        const queryBuilder = this.pdfRepository
            .createQueryBuilder('pdf')
            .leftJoinAndSelect('pdf.uploadedBy', 'user')
            .leftJoinAndSelect('pdf.pdfTags', 'pdfTags')
            .leftJoinAndSelect('pdfTags.tag', 'tag')
            .where('pdf.status = :status', { status: pdf_file_entity_1.PdfStatus.APPROVED });
        if (search) {
            queryBuilder.andWhere('pdf.title ILIKE :search', { search: `%${search}%` });
        }
        if (tags && tags.length > 0) {
            queryBuilder.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('pdfTag.pdfFileId')
                    .from('pdf_tags', 'pdfTag')
                    .innerJoin('tags', 'tag', 'pdfTag.tagId = tag.id')
                    .where('tag.name IN (:...tags)', { tags })
                    .groupBy('pdfTag.pdfFileId')
                    .having('COUNT(DISTINCT tag.name) = :tagCount', { tagCount: tags.length })
                    .getQuery();
                return `pdf.id IN ${subQuery}`;
            });
        }
        const validSortFields = ['createdAt', 'updatedAt', 'title'];
        const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
        queryBuilder.orderBy(`pdf.${sortField}`, order);
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [pdfs, total] = await queryBuilder.getManyAndCount();
        return {
            data: pdfs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPendingPdfs() {
        return this.pdfRepository.find({
            where: { status: pdf_file_entity_1.PdfStatus.PENDING },
            relations: ['uploadedBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async getPdfById(id) {
        const pdf = await this.pdfRepository.findOne({
            where: { id },
            relations: ['uploadedBy', 'pdfTags', 'pdfTags.tag'],
        });
        if (!pdf) {
            throw new common_1.NotFoundException(`Plik PDF o ID ${id} nie został znaleziony`);
        }
        return pdf;
    }
    async updateStatus(id, updateStatusDto) {
        const pdf = await this.getPdfById(id);
        pdf.status = updateStatusDto.status;
        await this.pdfRepository.save(pdf);
        console.log(`✅ PDF status updated: ${pdf.title} -> ${pdf.status}`);
        return pdf;
    }
    async deletePdf(id, user) {
        const pdf = await this.getPdfById(id);
        if (user.role !== 'admin' && pdf.uploadedById !== user.id) {
            throw new common_1.ForbiddenException('Nie masz uprawnień do usunięcia tego pliku');
        }
        await this.storageService.deleteFile(pdf.fileUrl);
        await this.pdfRepository.remove(pdf);
        console.log(`✅ PDF deleted: ${pdf.title} (ID: ${id})`);
    }
    async getUserPdfs(userId) {
        return this.pdfRepository.find({
            where: { uploadedById: userId },
            relations: ['pdfTags', 'pdfTags.tag'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pdf_file_entity_1.PdfFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map