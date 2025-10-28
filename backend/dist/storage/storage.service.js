"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Minio = __importStar(require("minio"));
const uuid_1 = require("uuid");
let StorageService = class StorageService {
    configService;
    minioClient;
    bucketName;
    getRequiredConfig(key) {
        const value = this.configService.get(key);
        if (value === undefined) {
            throw new common_1.InternalServerErrorException(`Krytyczny błąd: Wymagana zmienna konfiguracyjna "${key}" nie jest ustawiona.`);
        }
        return value;
    }
    constructor(configService) {
        this.configService = configService;
        this.minioClient = new Minio.Client({
            endPoint: this.getRequiredConfig('MINIO_ENDPOINT'),
            port: parseInt(this.getRequiredConfig('MINIO_PORT'), 10),
            useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
            accessKey: this.getRequiredConfig('MINIO_ACCESS_KEY'),
            secretKey: this.getRequiredConfig('MINIO_SECRET_KEY'),
        });
        this.bucketName = this.getRequiredConfig('MINIO_BUCKET_NAME');
        this.ensureBucketExists();
    }
    async ensureBucketExists() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                console.log(`✅ Bucket "${this.bucketName}" został utworzony`);
            }
        }
        catch (error) {
            console.error('❌ Błąd podczas sprawdzania/tworzenia bucketa:', error);
        }
    }
    async uploadFile(file) {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${(0, uuid_1.v4)()}.${fileExtension}`;
            const metaData = {
                'Content-Type': file.mimetype,
                'Original-Name': Buffer.from(file.originalname).toString('base64'),
            };
            await this.minioClient.putObject(this.bucketName, fileName, file.buffer, file.size, metaData);
            const fileUrl = `http://${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${this.bucketName}/${fileName}`;
            console.log(`✅ Plik uploaded: ${fileUrl}`);
            return fileUrl;
        }
        catch (error) {
            console.error('❌ Błąd podczas uploadu pliku:', error);
            throw new common_1.InternalServerErrorException('Nie udało się przesłać pliku');
        }
    }
    async deleteFile(fileUrl) {
        try {
            const fileName = fileUrl.split('/').pop();
            if (!fileName) {
                throw new common_1.InternalServerErrorException('Nieprawidłowy URL pliku. Nie udało się wyodrębnić nazwy pliku.');
            }
            await this.minioClient.removeObject(this.bucketName, fileName);
            console.log(`✅ Plik usunięty: ${fileName}`);
        }
        catch (error) {
            console.error('❌ Błąd podczas usuwania pliku:', error);
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Nie udało się usunąć pliku');
        }
    }
    async getFileStream(fileUrl) {
        try {
            const fileName = fileUrl.split('/').pop();
            if (!fileName) {
                throw new common_1.InternalServerErrorException('Nieprawidłowy URL pliku. Nie udało się wyodrębnić nazwy pliku.');
            }
            return await this.minioClient.getObject(this.bucketName, fileName);
        }
        catch (error) {
            console.error('❌ Błąd podczas pobierania pliku:', error);
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Nie udało się pobrać pliku');
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map