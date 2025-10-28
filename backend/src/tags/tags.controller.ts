import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * GET /tags - Pobierz wszystkie tagi (PUBLIC)
   */
  @Get()
  async getAllTags() {
    const tags = await this.tagsService.getAllTags();
    return {
      data: tags,
      count: tags.length,
    };
  }

  /**
   * GET /tags/stats - Statystyki tagów (PUBLIC)
   */
  @Get('stats')
  async getTagStats() {
    return this.tagsService.getTagStats();
  }

  /**
   * POST /tags - Utwórz nowy tag (ADMIN only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTag(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.createTag(createTagDto);
    return {
      message: 'Tag został utworzony',
      tag,
    };
  }

  /**
   * DELETE /tags/:id - Usuń tag (ADMIN only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTag(@Param('id') id: string) {
    await this.tagsService.deleteTag(id);
    return {
      message: 'Tag został usunięty (ze wszystkich PDF-ów)',
    };
  }

  /**
   * GET /tags/pdf/:pdfId - Pobierz tagi przypisane do PDF
   */
  @Get('pdf/:pdfId')
  async getPdfTags(@Param('pdfId') pdfId: string) {
    const tags = await this.tagsService.getPdfTags(pdfId);
    return {
      data: tags,
      count: tags.length,
    };
  }

  /**
   * POST /tags/pdf/:pdfId/assign - Przypisz tagi do PDF (replace) (ADMIN only)
   */
  @Post('pdf/:pdfId/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignTagsToPdf(
    @Param('pdfId') pdfId: string,
    @Body() assignTagsDto: AssignTagsDto,
  ) {
    const pdf = await this.tagsService.assignTagsToPdf(pdfId, assignTagsDto);
    return {
      message: 'Tagi zostały przypisane do pliku',
      pdf,
    };
  }

  /**
   * POST /tags/pdf/:pdfId/add - Dodaj tagi do PDF (additive) (ADMIN only)
   */
  @Post('pdf/:pdfId/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addTagsToPdf(
    @Param('pdfId') pdfId: string,
    @Body() assignTagsDto: AssignTagsDto,
  ) {
    const pdf = await this.tagsService.addTagsToPdf(pdfId, assignTagsDto);
    return {
      message: 'Tagi zostały dodane do pliku',
      pdf,
    };
  }

  /**
   * DELETE /tags/pdf/:pdfId/tag/:tagId - Usuń tag z PDF (ADMIN only)
   */
  @Delete('pdf/:pdfId/tag/:tagId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeTagFromPdf(
    @Param('pdfId') pdfId: string,
    @Param('tagId') tagId: string,
  ) {
    const pdf = await this.tagsService.removeTagFromPdf(pdfId, tagId);
    return {
      message: 'Tag został usunięty z pliku',
      pdf,
    };
  }
}
