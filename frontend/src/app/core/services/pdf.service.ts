import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../src/environments/environment';
import { PdfFile, PdfListResponse, PdfStatus } from '../models';

export interface QueryParams {
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pdf`;

  /**
   * Upload PDF
   */
  uploadPdf(title: string, file: File): Observable<{ message: string; pdf: PdfFile }> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    return this.http.post<{ message: string; pdf: PdfFile }>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  /**
   * Pobierz zatwierdzone pliki PDF
   */
  getApprovedPdfs(params?: QueryParams): Observable<PdfListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.tags && params.tags.length > 0) {
        httpParams = httpParams.set('tags', params.tags.join(','));
      }
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
      }
      if (params.order) {
        httpParams = httpParams.set('order', params.order);
      }
    }

    return this.http.get<PdfListResponse>(`${this.apiUrl}/approved`, { params: httpParams });
  }

  /**
   * Pobierz oczekujące pliki (ADMIN only)
   */
  getPendingPdfs(): Observable<{ data: PdfFile[]; count: number }> {
    return this.http.get<{ data: PdfFile[]; count: number }>(`${this.apiUrl}/pending`);
  }

  /**
   * Pobierz własne pliki
   */
  getMyPdfs(): Observable<{ data: PdfFile[]; count: number }> {
    return this.http.get<{ data: PdfFile[]; count: number }>(`${this.apiUrl}/my`);
  }

  /**
   * Pobierz pojedynczy plik po ID
   */
  getPdfById(id: string): Observable<PdfFile> {
    return this.http.get<PdfFile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Zmień status pliku (ADMIN only)
   */
  updateStatus(id: string, status: PdfStatus): Observable<{ message: string; pdf: PdfFile }> {
    return this.http.patch<{ message: string; pdf: PdfFile }>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  /**
   * Usuń plik
   */
  deletePdf(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
