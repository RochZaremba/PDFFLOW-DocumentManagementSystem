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
exports.PdfController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const pdf_service_1 = require("./pdf.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../entities/user.entity");
const upload_pdf_dto_1 = require("./dto/upload-pdf.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const query_pdf_dto_1 = require("./dto/query-pdf.dto");
let PdfController = class PdfController {
    pdfService;
    constructor(pdfService) {
        this.pdfService = pdfService;
    }
    async uploadPdf(uploadPdfDto, file, req) {
        if (!file) {
            throw new common_1.BadRequestException('Nie przesłano pliku');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Można przesyłać tylko pliki PDF');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('Plik jest za duży (max 10MB)');
        }
        const pdf = await this.pdfService.uploadPdf(uploadPdfDto, file, req.user);
        return {
            message: 'Plik został przesłany i czeka na akceptację',
            pdf,
        };
    }
    async getApprovedPdfs(queryDto) {
        return this.pdfService.getApprovedPdfs(queryDto);
    }
    async getPendingPdfs() {
        const pdfs = await this.pdfService.getPendingPdfs();
        return {
            data: pdfs,
            count: pdfs.length,
        };
    }
    async getMyPdfs(req) {
        const pdfs = await this.pdfService.getUserPdfs(req.user.id);
        return {
            data: pdfs,
            count: pdfs.length,
        };
    }
    async getPdfById(id) {
        return this.pdfService.getPdfById(id);
    }
    async updateStatus(id, updateStatusDto) {
        const pdf = await this.pdfService.updateStatus(id, updateStatusDto);
        return {
            message: `Status pliku został zmieniony na ${pdf.status}`,
            pdf,
        };
    }
    async deletePdf(id, req) {
        await this.pdfService.deletePdf(id, req.user);
        return {
            message: 'Plik został usunięty',
        };
    }
};
exports.PdfController = PdfController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_pdf_dto_1.UploadPdfDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "uploadPdf", null);
__decorate([
    (0, common_1.Get)('approved'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_pdf_dto_1.QueryPdfDto]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "getApprovedPdfs", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "getPendingPdfs", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "getMyPdfs", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "getPdfById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateStatusDto]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "deletePdf", null);
exports.PdfController = PdfController = __decorate([
    (0, common_1.Controller)('pdf'),
    __metadata("design:paramtypes", [pdf_service_1.PdfService])
], PdfController);
//# sourceMappingURL=pdf.controller.js.map