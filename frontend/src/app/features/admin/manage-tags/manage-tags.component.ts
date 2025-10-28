import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { PdfService, QueryParams } from '../../../core/services/pdf.service';
import { PdfFile } from '../../../core/models';
import { TagDialogComponent } from './tag-dialog/tag-dialog.component';

@Component({
  selector: 'app-manage-tags',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './manage-tags.component.html',
  styleUrls: ['./manage-tags.component.css'],
})
export class ManageTagsComponent implements OnInit {
  private pdfService = inject(PdfService);
  private dialog = inject(MatDialog);

  pdfs: PdfFile[] = [];
  isLoading = false;
  displayedColumns: string[] = ['title', 'status', 'tags', 'actions'];

  ngOnInit() {
    this.loadAllPdfs();
  }

  /**
   * Załaduj wszystkie PDF-y (approved + pending + rejected)
   */
  loadAllPdfs() {
    this.isLoading = true;

    // Pobierz approved (bo getApprovedPdfs zwraca tylko te)
    // Dla pełnego zarządzania tagami możemy pobrać też pending
    this.pdfService.getApprovedPdfs({ limit: 100 } as QueryParams).subscribe({
      next: (response) => {
        this.pdfs = response.data;
        this.isLoading = false;
        console.log('✅ PDFs loaded:', this.pdfs.length);
      },
      error: (error) => {
        console.error('Error loading PDFs:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Otwórz dialog zarządzania tagami
   */
  openTagDialog(pdf: PdfFile) {
    const dialogRef = this.dialog.open(TagDialogComponent, {
      width: '600px',
      data: { pdf },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Odśwież listę po zapisaniu
        this.loadAllPdfs();
      }
    });
  }

  /**
   * Pobierz tagi PDF-a
   */
  getPdfTags(pdf: PdfFile): string[] {
    if (!pdf.pdfTags || pdf.pdfTags.length === 0) {
      return [];
    }
    return pdf.pdfTags.map(pt => pt.tag.name);
  }

  /**
   * Format statusu
   */
  getStatusLabel(status: string): string {
    const labels: any = {
      pending: 'Oczekujący',
      approved: 'Zatwierdzony',
      rejected: 'Odrzucony',
    };
    return labels[status] || status;
  }

  /**
   * Kolor dla statusu
   */
  getStatusColor(status: string): string {
    const colors: any = {
      pending: 'accent',
      approved: 'primary',
      rejected: 'warn',
    };
    return colors[status] || '';
  }
}
