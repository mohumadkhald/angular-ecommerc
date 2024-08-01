import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl: string;

  getSubCategoriesByCategoryTitle(categoryTitle: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/sub-categories/find/${categoryTitle}`)
      .pipe(map((response) => response.collection));
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private configService: ConfigService
  ) {
    this.apiUrl = configService.getApiUri();
  }

  getAllCategories(): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/categories`)
      .pipe(map((response) => response.collection));
  }

  getAllSubCategories(): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/sub-categories`)
      .pipe(map((response) => response.collection));
  }
}
