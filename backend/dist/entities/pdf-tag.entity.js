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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfTag = void 0;
const typeorm_1 = require("typeorm");
const pdf_file_entity_1 = require("./pdf-file.entity");
const tag_entity_1 = require("./tag.entity");
let PdfTag = class PdfTag {
    id;
    pdfFile;
    tag;
    createdAt;
};
exports.PdfTag = PdfTag;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PdfTag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pdf_file_entity_1.PdfFile, (pdfFile) => pdfFile.pdfTags, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'pdfFileId' }),
    __metadata("design:type", pdf_file_entity_1.PdfFile)
], PdfTag.prototype, "pdfFile", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tag_entity_1.Tag, (tag) => tag.pdfTags, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tagId' }),
    __metadata("design:type", tag_entity_1.Tag)
], PdfTag.prototype, "tag", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PdfTag.prototype, "createdAt", void 0);
exports.PdfTag = PdfTag = __decorate([
    (0, typeorm_1.Entity)('pdf_tags')
], PdfTag);
//# sourceMappingURL=pdf-tag.entity.js.map