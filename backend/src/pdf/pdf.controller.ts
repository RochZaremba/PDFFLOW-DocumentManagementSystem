import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryPdfDto } from './dto/query-pdf.dto';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  /**
   * POST /pdf/upload - Upload nowego pliku PDF (USER + ADMIN)
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @Body() uploadPdfDto: UploadPdfDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Nie przesłano pliku');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Można przesyłać tylko pliki PDF');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Plik jest za duży (max 10MB)');
    }

    const pdf = await this.pdfService.uploadPdf(uploadPdfDto, file, req.user);

    return {
      message: 'Plik został przesłany i czeka na akceptację',
      pdf,
    };
  }

  /**
   * GET /pdf/approved - Pobierz zatwierdzone pliki (PUBLIC lub AUTH)
   */
  @Get('approved')
  async getApprovedPdfs(@Query() queryDto: QueryPdfDto) {
    return this.pdfService.getApprovedPdfs(queryDto);
  }

  /**
   * GET /pdf/pending - Pobierz oczekujące pliki (ADMIN only)
   */
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingPdfs() {
    const pdfs = await this.pdfService.getPendingPdfs();
    return {
      data: pdfs,
      count: pdfs.length,
    };
  }

  /**
   * GET /pdf/my - Pobierz własne pliki (USER + ADMIN)
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyPdfs(@Request() req) {
    const pdfs = await this.pdfService.getUserPdfs(req.user.id);
    return {
      data: pdfs,
      count: pdfs.length,
    };
  }

  /**
   * GET /pdf/:id - Pobierz pojedynczy plik po ID
   */
  @Get(':id')
  async getPdfById(@Param('id') id: string) {
    return this.pdfService.getPdfById(id);
  }

  /**
   * PATCH /pdf/:id/status - Zmień status pliku (ADMIN only)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    const pdf = await this.pdfService.updateStatus(id, updateStatusDto);
    return {
      message: `Status pliku został zmieniony na ${pdf.status}`,
      pdf,
    };
  }

  /**
   * DELETE /pdf/:id - Usuń plik (ADMIN lub właściciel)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePdf(@Param('id') id: string, @Request() req) {
    await this.pdfService.deletePdf(id, req.user);
    return {
      message: 'Plik został usunięty',
    };
  }
}
