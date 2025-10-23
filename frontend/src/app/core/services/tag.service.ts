import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../src/environments/environment';
import { Tag, TagStats, AssignTagsRequest, PdfFile } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tags`;

  /**
   * Pobierz wszystkie tagi
   */
  getAllTags(): Observable<{ data: Tag[]; count: number }> {
    return this.http.get<{ data: Tag[]; count: number }>(this.apiUrl);
  }

  /**
   * Pobierz statystyki tagów
   */
  getTagStats(): Observable<TagStats[]> {
    return this.http.get<TagStats[]>(`${this.apiUrl}/stats`);
  }

  /**
   * Utwórz nowy tag (ADMIN only)
   */
  createTag(name: string): Observable<{ message: string; tag: Tag }> {
    return this.http.post<{ message: string; tag: Tag }>(this.apiUrl, { name });
  }

  /**
   * Usuń tag (ADMIN only)
   */
  deleteTag(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Pobierz tagi przypisane do PDF
   */
  getPdfTags(pdfId: string): Observable<{ data: Tag[]; count: number }> {
    return this.http.get<{ data: Tag[]; count: number }>(`${this.apiUrl}/pdf/${pdfId}`);
  }

  /**
   * Przypisz tagi do PDF (replace) (ADMIN only)
   */
  assignTagsToPdf(pdfId: string, tagNames: string[]): Observable<{ message: string; pdf: PdfFile }> {
    return this.http.post<{ message: string; pdf: PdfFile }>(
      `${this.apiUrl}/pdf/${pdfId}/assign`,
      { tagNames }
    );
  }

  /**
   * Dodaj tagi do PDF (additive) (ADMIN only)
   */
  addTagsToPdf(pdfId: string, tagNames: string[]): Observable<{ message: string; pdf: PdfFile }> {
    return this.http.post<{ message: string; pdf: PdfFile }>(
      `${this.apiUrl}/pdf/${pdfId}/add`,
      { tagNames }
    );
  }

  /**
   * Usuń tag z PDF (ADMIN only)
   */
  removeTagFromPdf(pdfId: string, tagId: string): Observable<{ message: string; pdf: PdfFile }> {
    return this.http.delete<{ message: string; pdf: PdfFile }>(
      `${this.apiUrl}/pdf/${pdfId}/tag/${tagId}`
    );
  }
}
