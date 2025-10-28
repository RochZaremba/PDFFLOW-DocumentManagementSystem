import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { PdfFile } from './entities/pdf-file.entity';
import { Tag } from './entities/tag.entity';
import { PdfTag } from './entities/pdf-tag.entity';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { PdfModule } from './pdf/pdf.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // 👇 tu najważniejsza zmiana:
      entities: [User, PdfFile, Tag, PdfTag],
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
    }),
    AuthModule,
    StorageModule,
    PdfModule,
    TagsModule,
  ],
})
export class AppModule {}

