import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PdfFile, PdfStatus } from '../entities/pdf-file.entity';
import { User } from '../entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryPdfDto } from './dto/query-pdf.dto';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(PdfFile)
    private pdfRepository: Repository<PdfFile>,
    private storageService: StorageService,
  ) {}

  /**
   * Upload nowego pliku PDF
   */
  async uploadPdf(
    uploadPdfDto: UploadPdfDto,
    file: Express.Multer.File,
    user: User,
  ): Promise<PdfFile> {
    // 1. Upload pliku do MinIO
    const fileUrl = await this.storageService.uploadFile(file);

    // 2. Utwórz rekord w bazie danych
    const pdfFile = this.pdfRepository.create({
      title: uploadPdfDto.title,
      fileUrl,
      status: PdfStatus.PENDING, // domyślnie oczekujący
      uploadedById: user.id,
    });

    await this.pdfRepository.save(pdfFile);

    console.log(`✅ PDF uploaded: ${pdfFile.title} (ID: ${pdfFile.id})`);
    return pdfFile;
  }

  /**
   * Pobierz wszystkie zatwierdzone pliki PDF (z filtrowaniem i paginacją)
   */
  async getApprovedPdfs(queryDto: QueryPdfDto) {
    // NAPRAWA: Dodanie wartości domyślnych podczas dekonstrukcji
    const { 
      search, 
      tags, 
      page = 1,      // Domyślna wartość 1
      limit = 20,    // Domyślna wartość 20
      sort = 'createdAt', // Domyślna wartość 'createdAt'
      order = 'DESC' // Domyślna wartość 'DESC'
    } = queryDto;

    const queryBuilder = this.pdfRepository
      .createQueryBuilder('pdf')
      .leftJoinAndSelect('pdf.uploadedBy', 'user')
      .leftJoinAndSelect('pdf.pdfTags', 'pdfTags')
      .leftJoinAndSelect('pdfTags.tag', 'tag')
      .where('pdf.status = :status', { status: PdfStatus.APPROVED });

    // Filtrowanie po tytule (wyszukiwanie)
    if (search) {
      queryBuilder.andWhere('pdf.title ILIKE :search', { search: `%${search}%` });
    }

    // Filtrowanie po tagach (AND logic - musi mieć wszystkie podane tagi)
    if (tags && tags.length > 0) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('pdfTag.pdfFileId')
          .from('pdf_tags', 'pdfTag')
          .innerJoin('tags', 'tag', 'pdfTag.tagId = tag.id')
          .where('tag.name IN (:...tags)', { tags })
          .groupBy('pdfTag.pdfFileId')
          .having('COUNT(DISTINCT tag.name) = :tagCount', { tagCount: tags.length })
          .getQuery();

        return `pdf.id IN ${subQuery}`;
      });
    }

    // Sortowanie
    const validSortFields = ['createdAt', 'updatedAt', 'title'];
    // Linię 81 zmieniamy, by używała 'sort' bez obaw o 'undefined', 
    // ponieważ ma już domyślną wartość 'createdAt' z dekonstrukcji
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    queryBuilder.orderBy(`pdf.${sortField}`, order);

    // Paginacja
    // Po dekonstrukcji, page i limit są typu number i nie są undefined.
    const skip = (page - 1) * limit; 
    queryBuilder.skip(skip).take(limit);

    // Wykonaj query
    const [pdfs, total] = await queryBuilder.getManyAndCount();

    return {
      data: pdfs,
      meta: {
        total,
        page,
        limit,
        // limit jest teraz number
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pobierz wszystkie pliki oczekujące na akceptację (tylko dla ADMIN)
   */
  async getPendingPdfs(): Promise<PdfFile[]> {
    return this.pdfRepository.find({
      where: { status: PdfStatus.PENDING },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Pobierz pojedynczy plik PDF po ID
   */
  async getPdfById(id: string): Promise<PdfFile> {
    const pdf = await this.pdfRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'pdfTags', 'pdfTags.tag'],
    });

    if (!pdf) {
      throw new NotFoundException(`Plik PDF o ID ${id} nie został znaleziony`);
    }

    return pdf;
  }

  /**
   * Zmień status pliku PDF (ADMIN only)
   */
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<PdfFile> {
    const pdf = await this.getPdfById(id);

    pdf.status = updateStatusDto.status;
    await this.pdfRepository.save(pdf);

    console.log(`✅ PDF status updated: ${pdf.title} -> ${pdf.status}`);
    return pdf;
  }

  /**
   * Usuń plik PDF (ADMIN only lub właściciel)
   */
  async deletePdf(id: string, user: User): Promise<void> {
    const pdf = await this.getPdfById(id);

    // Sprawdź uprawnienia (tylko admin lub właściciel może usunąć)
    if (user.role !== 'admin' && pdf.uploadedById !== user.id) {
      throw new ForbiddenException('Nie masz uprawnień do usunięcia tego pliku');
    }

    // 1. Usuń plik z MinIO
    await this.storageService.deleteFile(pdf.fileUrl);

    // 2. Usuń rekord z bazy (CASCADE usunie też powiązania w pdf_tags)
    await this.pdfRepository.remove(pdf);

    console.log(`✅ PDF deleted: ${pdf.title} (ID: ${id})`);
  }

  /**
   * Pobierz wszystkie pliki użytkownika
   */
  async getUserPdfs(userId: string): Promise<PdfFile[]> {
    return this.pdfRepository.find({
      where: { uploadedById: userId },
      relations: ['pdfTags', 'pdfTags.tag'],
      order: { createdAt: 'DESC' },
    });
  }
}
