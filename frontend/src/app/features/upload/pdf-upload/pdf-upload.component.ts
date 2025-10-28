import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';
import { PdfService } from '../../../core/services/pdf.service';

@Component({
  selector: 'app-pdf-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './pdf-upload.component.html',
  styleUrls: ['./pdf-upload.component.css'],
})
export class PdfUploadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pdfService = inject(PdfService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public uploadSuccess: boolean = false;
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  filePreview: string | null = null;

  // Walidacja
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedTypes = ['application/pdf'];

  ngOnInit() {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    });
  }

  /**
   * Obsługa wyboru pliku
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Walidacja typu pliku
    if (!this.allowedTypes.includes(file.type)) {
      this.toastr.error('Można przesyłać tylko pliki PDF', 'Nieprawidłowy typ pliku');
      this.clearFile();
      return;
    }

    // Walidacja rozmiaru
    if (file.size > this.maxFileSize) {
      this.toastr.error('Plik jest za duży (max 10MB)', 'Plik zbyt duży');
      this.clearFile();
      return;
    }

    this.selectedFile = file;
    this.filePreview = file.name;
    console.log('✅ File selected:', file.name, `(${this.formatFileSize(file.size)})`);
  }

  /**
   * Usuń wybrany plik
   */
  clearFile() {
    this.selectedFile = null;
    this.filePreview = null;

    // Wyczyść input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Upload pliku
   */
  onSubmit() {
    if (this.uploadForm.invalid) {
      this.markFormGroupTouched(this.uploadForm);
      return;
    }

    if (!this.selectedFile) {
      this.toastr.error('Proszę wybrać plik PDF', 'Brak pliku');
      return;
    }

    this.isUploading = true;
    const title = this.uploadForm.get('title')?.value;

    this.pdfService.uploadPdf(title, this.selectedFile).subscribe({
      next: (response) => {
        this.uploadSuccess = true;
        this.toastr.success(
          'Plik został przesłany i czeka na akceptację przez administratora',
          'Upload zakończony!'
        );
      setTimeout(() => {
        this.uploadForm.reset();
        this.clearFile();
        this.uploadSuccess = false;
        this.isUploading = false;
      }, 1500);

        // Reset formularza
        this.uploadForm.reset();
        this.clearFile();
        this.isUploading = false;

        // Opcjonalnie: przekieruj na "Moje pliki" lub "Browse"
        // this.router.navigate(['/browse']);
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error:', error);
        // Błąd jest już obsłużony przez errorInterceptor
      },
    });
  }

  /**
   * Helper do oznaczania pól jako touched
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Format rozmiaru pliku
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Getter dla łatwego dostępu
   */
  get title() {
    return this.uploadForm.get('title');
  }
}
