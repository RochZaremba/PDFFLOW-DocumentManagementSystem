import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltips';
import { ToastrService } from 'ngx-toastr';
import { PdfService } from '../../../core/services/pdf.service';
import { PdfFile, PdfStatus } from '../../../core/models';

@Component({
  selector: 'app-my-files',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './my-files.component.html',
  styleUrls: ['./my-files.component.css'],
})
export class MyFilesComponent implements OnInit {
  private pdfService = inject(PdfService);
  private toastr = inject(ToastrService);

  pdfs: PdfFile[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadMyFiles();
  }

  /**
   * Załaduj pliki użytkownika
   */
  loadMyFiles() {
    this.isLoading = true;
    this.pdfService.getMyPdfs().subscribe({
      next: (response) => {
        this.pdfs = response.data;
        this.isLoading = false;
        console.log('✅ My files loaded:', this.pdfs.length);
      },
      error: (error) => {
        console.error('Error loading my files:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Usuń plik
   */
  deleteFile(pdf: PdfFile) {
    const confirmed = confirm(
      `Czy na pewno chcesz usunąć dokument "${pdf.title}"?\n\n⚠️ Ta operacja jest nieodwracalna!`
    );

    if (!confirmed) {
      return;
    }

    this.pdfService.deletePdf(pdf.id).subscribe({
      next: () => {
        this.toastr.success(`Dokument "${pdf.title}" został usunięty`, 'Usunięto');
        this.loadMyFiles(); // Odśwież listę
      },
      error: (error) => {
        console.error('Error deleting file:', error);
      },
    });
  }

  /**
   * Pobierz PDF
   */
  downloadPdf(pdf: PdfFile) {
    window.open(pdf.fileUrl, '_blank');
  }

  /**
   * Pobierz tagi
   */
  getPdfTags(pdf: PdfFile): string[] {
    if (!pdf.pdfTags || pdf.pdfTags.length === 0) {
      return [];
    }
    return pdf.pdfTags.map(pt => pt.tag.name);
  }

  /**
   * Status label
   */
  getStatusLabel(status: string): string {
    const labels: any = {
      pending: 'Oczekuje',
      approved: 'Zatwierdzony',
      rejected: 'Odrzucony',
    };
    return labels[status] || status;
  }

  /**
   * Status color
   */
  getStatusColor(status: string): string {
    const colors: any = {
      pending: 'accent',
      approved: 'primary',
      rejected: 'warn',
    };
    return colors[status] || '';
  }

  /**
   * Status icon
   */
  getStatusIcon(status: string): string {
    const icons: any = {
      pending: 'schedule',
      approved: 'check_circle',
      rejected: 'cancel',
    };
    return icons[status] || 'help';
  }

  /**
   * Format daty
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Czy można usunąć (tylko pending i rejected)
   */
  canDelete(pdf: PdfFile): boolean {
    return pdf.status === PdfStatus.PENDING || pdf.status === PdfStatus.REJECTED;
  }
}
