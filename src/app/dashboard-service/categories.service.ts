import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  tap,
} from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../service/config.service';
import { DashboardService } from './dashboard.service';
@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private apiUrl: string;

  private categoriesCache$?: Observable<any[]>;
  private refresh$ = new Subject<void>(); // optional if you want manual refresh triggers

  constructor(
    private http: HttpClient,
    private countService: DashboardService,
    private configService: ConfigService
  ) {
    this.apiUrl = configService.getApiUri();
  }

  // --- Get all categories with caching ---
  getAllCategories(): Observable<any[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http
        .get<any>(`${this.apiUrl}/categories`)
        .pipe(
          map((res) => res.collection),
          shareReplay(1)
        );
    }
    return this.categoriesCache$;
  }

  // --- Manual reload (optional) ---
  refreshCategories(): Observable<any[]> {
    this.categoriesCache$ = undefined;
    return this.getAllCategories();
  }

  // --- Add category ---
  addCategory(category: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/categories`, category)
      .pipe(tap(() => this.countService.refreshCounts())); // auto-refresh counts
  }

  // --- Edit category ---
  editCategory(category: FormData, catId: number): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/categories/${catId}`, category)
      .pipe(tap(() => this.countService.refreshCounts())); // auto-refresh counts
  }

  // --- Delete category ---
  deleteCategory(catId: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/categories/${catId}`)
      .pipe(tap(() => this.countService.refreshCounts())); // auto-refresh counts
  }

  // --- Change category photo ---
  changePhoto(title: string, image: File, url: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);

    const apiUrlWithParams = `${this.apiUrl}/categories/photo?title=${title}&url=${url}`;

    return this.http.patch<any>(apiUrlWithParams, formData).pipe(
      tap(() => this.countService.refreshCounts()), // optional, if photo counts affect dashboard
      catchError((error) => {
        console.error('Change photo error:', error);
        return of(null);
      })
    );
  }
}
