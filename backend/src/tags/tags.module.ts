import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from '../entities/tag.entity';
import { PdfTag } from '../entities/pdf-tag.entity';
import { PdfFile } from '../entities/pdf-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, PdfTag, PdfFile])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
