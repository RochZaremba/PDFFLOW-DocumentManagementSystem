import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PdfFile } from './pdf-file.entity';
import { Tag } from './tag.entity';

@Entity('pdf_tags')
export class PdfTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacja: PdfTag -> PdfFile (wiele wpisów może wskazywać na jeden plik)
  @ManyToOne(() => PdfFile, (pdfFile) => pdfFile.pdfTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pdfFileId' })
  pdfFile: PdfFile;

  // Relacja: PdfTag -> Tag (wiele wpisów może wskazywać na jeden tag)
  @ManyToOne(() => Tag, (tag) => tag.pdfTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;
}
