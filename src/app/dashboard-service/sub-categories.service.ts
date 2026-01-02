import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../service/config.service';
import { DashboardService } from './dashboard.service';
@Injectable({
  providedIn: 'root',
})
export class SubCategoriesService {
  private apiUrl: string;


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService,
    private dashboardService: DashboardService
  ) {
    this.apiUrl = configService.getApiUri();
  }

  // ✅ Lightweight request for count only

  // Existing methods
  getAllSubCategories(): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/sub-categories`)
      .pipe(map((response) => response.collection));
  }

  addSubCategory(category: FormData): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/sub-categories`, category)
      .pipe(tap(() => this.dashboardService.refreshCounts()));
  }

  editSubCategory(category: FormData, subCatId: number): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/sub-categories/${subCatId}`, category)
      .pipe(tap(() => this.dashboardService.refreshCounts()));
  }

  deleteSubCategory(catId: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/sub-categories/${catId}`)
      .pipe(tap(() => this.dashboardService.refreshCounts()));
  }

    changePhoto(title: string, image: File, url: string): Observable<any> {
      const formData = new FormData();
      formData.append('image', image);
  
      const apiUrlWithParams = `${this.apiUrl}/categories/photo?title=${title}&url=${url}`;
  
      return this.http.patch<any>(apiUrlWithParams, formData).pipe(
        tap(() => this.dashboardService.refreshCounts()), // optional, if photo counts affect dashboard
        catchError((error) => {
          console.error('Change photo error:', error);
          return of(null);
        })
      );
    }
}
