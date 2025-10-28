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
exports.PdfFile = exports.PdfStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const pdf_tag_entity_1 = require("./pdf-tag.entity");
var PdfStatus;
(function (PdfStatus) {
    PdfStatus["PENDING"] = "pending";
    PdfStatus["APPROVED"] = "approved";
    PdfStatus["REJECTED"] = "rejected";
})(PdfStatus || (exports.PdfStatus = PdfStatus = {}));
let PdfFile = class PdfFile {
    id;
    title;
    fileUrl;
    status;
    createdAt;
    updatedAt;
    uploadedBy;
    uploadedById;
    pdfTags;
};
exports.PdfFile = PdfFile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PdfFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PdfFile.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PdfFile.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PdfStatus,
        default: PdfStatus.PENDING,
    }),
    __metadata("design:type", String)
], PdfFile.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PdfFile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PdfFile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.uploadedFiles, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'uploadedById' }),
    __metadata("design:type", user_entity_1.User)
], PdfFile.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PdfFile.prototype, "uploadedById", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pdf_tag_entity_1.PdfTag, (pdfTag) => pdfTag.pdfFile),
    __metadata("design:type", Array)
], PdfFile.prototype, "pdfTags", void 0);
exports.PdfFile = PdfFile = __decorate([
    (0, typeorm_1.Entity)('pdf_files')
], PdfFile);
//# sourceMappingURL=pdf-file.entity.js.map