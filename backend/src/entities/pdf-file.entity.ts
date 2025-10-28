import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PdfTag } from './pdf-tag.entity';

export enum PdfStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('pdf_files')
export class PdfFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  fileUrl: string; // URL do pliku w storage (S3, MinIO, etc.)

  @Column({
    type: 'enum',
    enum: PdfStatus,
    default: PdfStatus.PENDING,
  })
  status: PdfStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacja: PdfFile -> User (wiele plików może być wgranych przez jednego usera)
  @ManyToOne(() => User, (user) => user.uploadedFiles, { eager: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  // Relacja: PdfFile -> PdfTag (jeden plik może mieć wiele tagów)
  @OneToMany(() => PdfTag, (pdfTag) => pdfTag.pdfFile)
  pdfTags: PdfTag[];
}
