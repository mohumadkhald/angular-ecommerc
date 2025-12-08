import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl: string;

  getSubCategoriesByCategoryTitle(categoryTitle: string): Observable<any> {
    const encodedCategoryTitle = encodeURIComponent(categoryTitle);
    return this.http
      .get<any>(`${this.apiUrl}/sub-categories/find/${encodedCategoryTitle}`)
      .pipe(map((response) => response.collection));
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private configService: ConfigService
  ) {
    this.apiUrl = configService.getApiUri();
  }

  private categoriesCache$?: Observable<any[]>;
  private subCategoriesCache$?: Observable<any[]>;
  private refresh$ = new Subject<void>(); // triggers reload

  getAllCategories(): Observable<any[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http
        .get<any>(`${this.apiUrl}/categories`)
        .pipe(
          map((response) => response.collection),
        );
    }
    return this.categoriesCache$;
  }

  // Call this after add or delete
  reloadCategories() {
    this.refresh$.next();
  }

  getAllSubCategories(): Observable<any[]> {
    if (!this.subCategoriesCache$) {
      this.subCategoriesCache$ = this.http
        .get<any>(`${this.apiUrl}/sub-categories`)
        .pipe(
          map((response) => response.collection),
          shareReplay(1)
        );
    }
    return this.subCategoriesCache$;
  }
  refreshCategories(): Observable<any[]> {
    this.categoriesCache$ = undefined;
    return this.getAllCategories();
  }

  refreshSubCategories(): Observable<any[]> {
    this.subCategoriesCache$ = undefined;
    return this.getAllSubCategories();
  }
}
