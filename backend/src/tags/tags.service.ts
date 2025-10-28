import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { PdfTag } from '../entities/pdf-tag.entity';
import { PdfFile } from '../entities/pdf-file.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(PdfTag)
    private pdfTagRepository: Repository<PdfTag>,
    @InjectRepository(PdfFile)
    private pdfRepository: Repository<PdfFile>,
  ) {}

  /**
   * Pobierz wszystkie tagi
   */
  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Utwórz nowy tag (ADMIN only)
   */
  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    const { name } = createTagDto;

    // Sprawdź, czy tag już istnieje (case-insensitive)
    const existingTag = await this.tagRepository.findOne({
      where: { name },
    });

    if (existingTag) {
      throw new ConflictException(`Tag "${name}" już istnieje`);
    }

    const tag = this.tagRepository.create({ name });
    await this.tagRepository.save(tag);

    console.log(`✅ Tag created: ${tag.name}`);
    return tag;
  }

  /**
   * Znajdź lub utwórz tag (helper method)
   */
  private async findOrCreateTag(tagName: string): Promise<Tag> {
    const normalizedName = tagName.trim().toLowerCase();

    let tag = await this.tagRepository.findOne({
      where: { name: normalizedName },
    });

    if (!tag) {
      tag = this.tagRepository.create({ name: normalizedName });
      await this.tagRepository.save(tag);
      console.log(`✅ Tag auto-created: ${tag.name}`);
    }

    return tag;
  }

  /**
   * Przypisz tagi do PDF (ADMIN only)
   * Zastępuje istniejące tagi nowymi (replace logic)
   */
  async assignTagsToPdf(pdfId: string, assignTagsDto: AssignTagsDto): Promise<PdfFile> {
    const { tagNames } = assignTagsDto;

    // Sprawdź, czy PDF istnieje
    let pdf = await this.pdfRepository.findOne({
      where: { id: pdfId },
      relations: ['pdfTags', 'pdfTags.tag'],
    });

    if (!pdf) {
      throw new NotFoundException(`Plik PDF o ID ${pdfId} nie został znaleziony`);
    }

    // 1. Usuń wszystkie istniejące powiązania
    if (pdf.pdfTags.length > 0) {
      await this.pdfTagRepository.remove(pdf.pdfTags);
    }

    // 2. Utwórz nowe powiązania
    const tags = await Promise.all(
      tagNames.map(tagName => this.findOrCreateTag(tagName)),
    );

    const pdfTags = tags.map(tag => {
      return this.pdfTagRepository.create({
        pdfFile: pdf,
        tag,
      });
    });

    await this.pdfTagRepository.save(pdfTags);

    console.log(`✅ Tags assigned to PDF ${pdf.title}: ${tagNames.join(', ')}`);

    // Zwróć zaktualizowany PDF z tagami
    const updatedPdf = await this.pdfRepository.findOne({
      where: { id: pdfId },
      relations: ['pdfTags', 'pdfTags.tag', 'uploadedBy'],
    });
    
    // NAPRAWA: Dodanie sprawdzenia, które zawęża typ do PdfFile
    if (!updatedPdf) {
      // Choć bardzo mało prawdopodobne, należy obsłużyć błąd
      throw new NotFoundException(`Wystąpił błąd podczas pobierania zaktualizowanego pliku PDF o ID ${pdfId}`);
    }
    return updatedPdf;
  }

  /**
   * Dodaj tagi do PDF (additive logic - nie usuwa istniejących)
   */
  async addTagsToPdf(pdfId: string, assignTagsDto: AssignTagsDto): Promise<PdfFile> {
    let pdf = await this.pdfRepository.findOne({
      where: { id: pdfId },
      relations: ['pdfTags', 'pdfTags.tag'],
    });

    if (!pdf) {
      throw new NotFoundException(`Plik PDF o ID ${pdfId} nie został znaleziony`);
    }

    const { tagNames } = assignTagsDto;
    
    // Pobierz już istniejące tagi dla tego PDF
    const existingTagNames = pdf.pdfTags.map(pt => pt.tag.name);

    // Filtruj tylko nowe tagi (które jeszcze nie są przypisane)
    const newTagNames = tagNames.filter(
      tagName => !existingTagNames.includes(tagName.trim().toLowerCase()),
    );

    if (newTagNames.length === 0) {
      console.log(`⚠️ Wszystkie tagi już są przypisane do PDF ${pdf.title}`);
      return pdf;
    }

    // Utwórz nowe powiązania
    const tags = await Promise.all(
      newTagNames.map(tagName => this.findOrCreateTag(tagName)),
    );

    const pdfTags = tags.map(tag => {
      return this.pdfTagRepository.create({
        pdfFile: pdf,
        tag,
      });
    });

    await this.pdfTagRepository.save(pdfTags);

    console.log(`✅ Tags added to PDF ${pdf.title}: ${newTagNames.join(', ')}`);

    // Zwróć zaktualizowany PDF
    const updatedPdf = await this.pdfRepository.findOne({
      where: { id: pdfId },
      relations: ['pdfTags', 'pdfTags.tag', 'uploadedBy'],
    });

    // NAPRAWA: Dodanie sprawdzenia, które zawęża typ do PdfFile
    if (!updatedPdf) {
      throw new NotFoundException(`Wystąpił błąd podczas pobierania zaktualizowanego pliku PDF o ID ${pdfId}`);
    }
    return updatedPdf;
  }

  /**
   * Usuń tag z PDF
   */
  async removeTagFromPdf(pdfId: string, tagId: string): Promise<PdfFile> {
    // Znajdź powiązanie PDF-Tag
    const pdfTag = await this.pdfTagRepository.findOne({
      where: {
        pdfFile: { id: pdfId },
        tag: { id: tagId },
      },
      relations: ['pdfFile', 'tag'],
    });

    if (!pdfTag) {
      throw new NotFoundException(
        `Powiązanie między PDF ${pdfId} a Tag ${tagId} nie istnieje`,
      );
    }

    await this.pdfTagRepository.remove(pdfTag);

    console.log(`✅ Tag ${pdfTag.tag.name} removed from PDF ${pdfTag.pdfFile.title}`);

    // Zwróć zaktualizowany PDF
    const updatedPdf = await this.pdfRepository.findOne({
      where: { id: pdfId },
      relations: ['pdfTags', 'pdfTags.tag', 'uploadedBy'],
    });

    // NAPRAWA: Dodanie sprawdzenia, które zawęża typ do PdfFile
    if (!updatedPdf) {
      throw new NotFoundException(`Wystąpił błąd podczas pobierania zaktualizowanego pliku PDF o ID ${pdfId}`);
    }
    return updatedPdf;
  }

  /**
   * Pobierz tagi przypisane do konkretnego PDF
   */
  async getPdfTags(pdfId: string): Promise<Tag[]> {
    const pdf = await this.pdfRepository.findOne({
      where: { id: pdfId },
      relations: ['pdfTags', 'pdfTags.tag'],
    });

    if (!pdf) {
      throw new NotFoundException(`Plik PDF o ID ${pdfId} nie został znaleziony`);
    }

    return pdf.pdfTags.map(pt => pt.tag);
  }

  /**
   * Usuń tag ze słownika (ADMIN only)
   * UWAGA: To usunie tag ze WSZYSTKICH PDF-ów (CASCADE)
   */
  async deleteTag(tagId: string): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag o ID ${tagId} nie został znaleziony`);
    }

    await this.tagRepository.remove(tag);
    console.log(`✅ Tag deleted: ${tag.name} (usunięty ze wszystkich PDF-ów)`);
  }

  /**
   * Pobierz statystyki tagów (ile razy każdy tag jest używany)
   */
  async getTagStats(): Promise<Array<{ tag: Tag; count: number }>> {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.pdfTags', 'pdfTag')
      .select('tag')
      .addSelect('COUNT(pdfTag.id)', 'count')
      .groupBy('tag.id')
      .orderBy('count', 'DESC')
      .getRawAndEntities();

    return tags.entities.map((tag, index) => ({
      tag,
      count: parseInt(tags.raw[index].count, 10),
    }));
  }
}
