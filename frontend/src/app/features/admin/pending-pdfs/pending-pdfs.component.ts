import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PdfService } from '../../../core/services/pdf.service';
import { PdfFile, PdfStatus } from '../../../core/models';

@Component({
  selector: 'app-pending-pdfs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './pending-pdfs.component.html',
  styleUrls: ['./pending-pdfs.component.css'],
})
export class PendingPdfsComponent implements OnInit {
  private pdfService = inject(PdfService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  pdfs: PdfFile[] = [];
  isLoading = false;
  displayedColumns: string[] = ['title', 'uploadedBy', 'createdAt', 'actions'];

  ngOnInit() {
    this.loadPendingPdfs();
  }

  /**
   * Załaduj oczekujące PDF-y
   */
  loadPendingPdfs() {
    this.isLoading = true;
    this.pdfService.getPendingPdfs().subscribe({
      next: (response) => {
        this.pdfs = response.data;
        this.isLoading = false;
        console.log('✅ Pending PDFs loaded:', this.pdfs.length);
      },
      error: (error) => {
        console.error('Error loading pending PDFs:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Zatwierdź PDF
   */
  approvePdf(pdf: PdfFile) {
    this.pdfService.updateStatus(pdf.id, PdfStatus.APPROVED).subscribe({
      next: (response) => {
        this.toastr.success(
          `Dokument "${pdf.title}" został zatwierdzony`,
          'Zatwierdzono!'
        );
        this.loadPendingPdfs(); // Odśwież listę
      },
      error: (error) => {
        console.error('Error approving PDF:', error);
      },
    });
  }

  /**
   * Odrzuć PDF
   */
  rejectPdf(pdf: PdfFile) {
    // Potwierdzenie przed odrzuceniem
    const confirmed = confirm(
      `Czy na pewno chcesz odrzucić dokument "${pdf.title}"?\n\nDokument pozostanie w systemie ze statusem "Odrzucony".`
    );

    if (!confirmed) {
      return;
    }

    this.pdfService.updateStatus(pdf.id, PdfStatus.REJECTED).subscribe({
      next: (response) => {
        this.toastr.warning(
          `Dokument "${pdf.title}" został odrzucony`,
          'Odrzucono'
        );
        this.loadPendingPdfs(); // Odśwież listę
      },
      error: (error) => {
        console.error('Error rejecting PDF:', error);
      },
    });
  }

  /**
   * Usuń PDF
   */
  deletePdf(pdf: PdfFile) {
    const confirmed = confirm(
      `Czy na pewno chcesz USUNĄĆ dokument "${pdf.title}"?\n\n⚠️ Ta operacja jest nieodwracalna! Plik zostanie usunięty z systemu i serwera.`
    );

    if (!confirmed) {
      return;
    }

    this.pdfService.deletePdf(pdf.id).subscribe({
      next: (response) => {
        this.toastr.success(
          `Dokument "${pdf.title}" został usunięty`,
          'Usunięto'
        );
        this.loadPendingPdfs(); // Odśwież listę
      },
      error: (error) => {
        console.error('Error deleting PDF:', error);
      },
    });
  }

  /**
   * Podgląd PDF (otwórz w nowej karcie)
   */
  previewPdf(pdf: PdfFile) {
    window.open(pdf.fileUrl, '_blank');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
