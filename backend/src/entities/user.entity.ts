import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PdfFile } from './pdf-file.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // zahaszowane hasło (bcrypt)

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  // Relacja: User -> PdfFile (jeden użytkownik może wgrać wiele plików)
  @OneToMany(() => PdfFile, (pdfFile) => pdfFile.uploadedBy)
  uploadedFiles: PdfFile[];
}
