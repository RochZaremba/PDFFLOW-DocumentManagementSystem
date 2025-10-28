import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PdfTag } from './pdf-tag.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // unikalna nazwa tagu (np. "Faktura", "Raport", "2024")

  @CreateDateColumn()
  createdAt: Date;

  // Relacja: Tag -> PdfTag
  @OneToMany(() => PdfTag, (pdfTag) => pdfTag.tag)
  pdfTags: PdfTag[];
}
