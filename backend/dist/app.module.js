"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("./entities/user.entity");
const pdf_file_entity_1 = require("./entities/pdf-file.entity");
const tag_entity_1 = require("./entities/tag.entity");
const pdf_tag_entity_1 = require("./entities/pdf-tag.entity");
const auth_module_1 = require("./auth/auth.module");
const storage_module_1 = require("./storage/storage.module");
const pdf_module_1 = require("./pdf/pdf.module");
const tags_module_1 = require("./tags/tags.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                entities: [user_entity_1.User, pdf_file_entity_1.PdfFile, tag_entity_1.Tag, pdf_tag_entity_1.PdfTag],
                synchronize: true,
                autoLoadEntities: true,
                logging: true,
            }),
            auth_module_1.AuthModule,
            storage_module_1.StorageModule,
            pdf_module_1.PdfModule,
            tags_module_1.TagsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map