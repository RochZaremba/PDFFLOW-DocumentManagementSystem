import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { TagService } from '../../../../core/services/tag.service';
import { PdfFile, Tag } from '../../../../core/models';

@Component({
  selector: 'app-tag-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tag-dialog.component.html',
  styleUrls: ['./tag-dialog.component.css'],
})
export class TagDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tagService = inject(TagService);
  private toastr = inject(ToastrService);
  private dialogRef = inject(MatDialogRef<TagDialogComponent>);

  tagForm!: FormGroup;
  allTags: Tag[] = [];
  currentTags: string[] = [];
  isLoading = false;
  isSaving = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { pdf: PdfFile }) {
    // Pobierz aktualne tagi PDF-a
    if (data.pdf.pdfTags) {
      this.currentTags = data.pdf.pdfTags.map(pt => pt.tag.name);
    }
  }

  ngOnInit() {
    this.tagForm = this.fb.group({
      newTag: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    });

    this.loadAllTags();
  }

  /**
   * Załaduj wszystkie dostępne tagi
   */
  loadAllTags() {
    this.isLoading = true;
    this.tagService.getAllTags().subscribe({
      next: (response) => {
        this.allTags = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Dodaj tag do listy
   */
  addTag(tagName: string) {
    const normalized = tagName.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    if (this.currentTags.includes(normalized)) {
      this.toastr.warning('Ten tag jest już przypisany', 'Duplikat');
      return;
    }

    this.currentTags.push(normalized);
    this.tagForm.get('newTag')?.reset();
  }

  /**
   * Usuń tag z listy
   */
  removeTag(tagName: string) {
    this.currentTags = this.currentTags.filter(t => t !== tagName);
  }

  /**
   * Dodaj tag z istniejących (kliknięcie na sugestię)
   */
  addExistingTag(tag: Tag) {
    this.addTag(tag.name);
  }

  /**
   * Zapisz zmiany (wyślij do backendu)
   */
  save() {
    this.isSaving = true;

    this.tagService.assignTagsToPdf(this.data.pdf.id, this.currentTags).subscribe({
      next: (response) => {
        this.toastr.success('Tagi zostały zaktualizowane', 'Sukces');
        this.dialogRef.close(true); // Zamknij dialog i zwróć sukces
      },
      error: (error) => {
        console.error('Error saving tags:', error);
        this.isSaving = false;
      },
    });
  }

  /**
   * Zamknij dialog bez zapisywania
   */
  cancel() {
    this.dialogRef.close(false);
  }

  /**
   * Pobierz sugestie tagów (nie używane jeszcze w current tags)
   */
  getAvailableTags(): Tag[] {
    return this.allTags.filter(tag => !this.currentTags.includes(tag.name));
  }
}
