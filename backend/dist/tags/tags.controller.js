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
exports.TagsController = void 0;
const common_1 = require("@nestjs/common");
const tags_service_1 = require("./tags.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../entities/user.entity");
const create_tag_dto_1 = require("./dto/create-tag.dto");
const assign_tags_dto_1 = require("./dto/assign-tags.dto");
let TagsController = class TagsController {
    tagsService;
    constructor(tagsService) {
        this.tagsService = tagsService;
    }
    async getAllTags() {
        const tags = await this.tagsService.getAllTags();
        return {
            data: tags,
            count: tags.length,
        };
    }
    async getTagStats() {
        return this.tagsService.getTagStats();
    }
    async createTag(createTagDto) {
        const tag = await this.tagsService.createTag(createTagDto);
        return {
            message: 'Tag został utworzony',
            tag,
        };
    }
    async deleteTag(id) {
        await this.tagsService.deleteTag(id);
        return {
            message: 'Tag został usunięty (ze wszystkich PDF-ów)',
        };
    }
    async getPdfTags(pdfId) {
        const tags = await this.tagsService.getPdfTags(pdfId);
        return {
            data: tags,
            count: tags.length,
        };
    }
    async assignTagsToPdf(pdfId, assignTagsDto) {
        const pdf = await this.tagsService.assignTagsToPdf(pdfId, assignTagsDto);
        return {
            message: 'Tagi zostały przypisane do pliku',
            pdf,
        };
    }
    async addTagsToPdf(pdfId, assignTagsDto) {
        const pdf = await this.tagsService.addTagsToPdf(pdfId, assignTagsDto);
        return {
            message: 'Tagi zostały dodane do pliku',
            pdf,
        };
    }
    async removeTagFromPdf(pdfId, tagId) {
        const pdf = await this.tagsService.removeTagFromPdf(pdfId, tagId);
        return {
            message: 'Tag został usunięty z pliku',
            pdf,
        };
    }
};
exports.TagsController = TagsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "getAllTags", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "getTagStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tag_dto_1.CreateTagDto]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "createTag", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "deleteTag", null);
__decorate([
    (0, common_1.Get)('pdf/:pdfId'),
    __param(0, (0, common_1.Param)('pdfId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "getPdfTags", null);
__decorate([
    (0, common_1.Post)('pdf/:pdfId/assign'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('pdfId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_tags_dto_1.AssignTagsDto]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "assignTagsToPdf", null);
__decorate([
    (0, common_1.Post)('pdf/:pdfId/add'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('pdfId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_tags_dto_1.AssignTagsDto]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "addTagsToPdf", null);
__decorate([
    (0, common_1.Delete)('pdf/:pdfId/tag/:tagId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('pdfId')),
    __param(1, (0, common_1.Param)('tagId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TagsController.prototype, "removeTagFromPdf", null);
exports.TagsController = TagsController = __decorate([
    (0, common_1.Controller)('tags'),
    __metadata("design:paramtypes", [tags_service_1.TagsService])
], TagsController);
//# sourceMappingURL=tags.controller.js.map