import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PdfService } from '../../../core/services/pdf.service';
import { TagService } from '../../../core/services/tag.service';
import { PdfFile, Tag } from '../../../core/models';

@Component({
  selector: 'app-pdf-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSelectModule,
  ],
  templateUrl: './pdf-list.component.html',
  styleUrls: ['./pdf-list.component.css'],
})
export class PdfListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pdfService = inject(PdfService);
  private tagService = inject(TagService);

  pdfs: PdfFile[] = [];
  allTags: Tag[] = [];
  isLoading = false;

  // Paginacja
  totalPdfs = 0;
  pageSize = 10;
  currentPage = 1;

  // Formularz filtrowania
  filterForm!: FormGroup;

  ngOnInit() {
    // Inicjalizuj formularz
    this.filterForm = this.fb.group({
      search: [''],
      selectedTags: [[]],
    });

    // Załaduj tagi
    this.loadTags();

    // Załaduj PDF-y
    this.loadPdfs();

    // Nasłuchuj zmian w polu wyszukiwania (z debounce)
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset do pierwszej strony
        this.loadPdfs();
      });

    // Nasłuchuj zmian w tagach
    this.filterForm.get('selectedTags')?.valueChanges
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPdfs();
      });
  }

  /**
   * Załaduj wszystkie tagi
   */
  loadTags() {
    this.tagService.getAllTags().subscribe({
      next: (response) => {
        this.allTags = response.data;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      },
    });
  }

  /**
   * Załaduj PDF-y z filtrami
   */
  loadPdfs() {
    this.isLoading = true;

    const search = this.filterForm.get('search')?.value || '';
    const selectedTags = this.filterForm.get('selectedTags')?.value || [];

    this.pdfService.getApprovedPdfs({
      search,
      tags: selectedTags,
      page: this.currentPage,
      limit: this.pageSize,
    }).subscribe({
      next: (response) => {
        this.pdfs = response.data;
        this.totalPdfs = response.meta.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading PDFs:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Obsługa zmiany strony (paginacja)
   */
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPdfs();
  }

  /**
   * Resetuj filtry
   */
  resetFilters() {
    this.filterForm.reset({
      search: '',
      selectedTags: [],
    });
    this.currentPage = 1;
    this.loadPdfs();
  }

  /**
   * Pobierz PDF (otwórz w nowej karcie)
   */
  downloadPdf(pdf: PdfFile) {
    window.open(pdf.fileUrl, '_blank');
  }

  /**
   * Pobierz tagi z PDF
   */
  getPdfTags(pdf: PdfFile): string[] {
    if (!pdf.pdfTags || pdf.pdfTags.length === 0) {
      return [];
    }
    return pdf.pdfTags.map(pt => pt.tag.name);
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
}
