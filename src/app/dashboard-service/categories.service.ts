import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, Subject } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../service/config.service';
@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService
  ) {
    this.apiUrl = configService.getApiUri();
  }
  token: string | null = this.authService.getToken();

  private categoriesCache$?: Observable<any[]>;
    private refresh$ = new Subject<void>(); // triggers reload
  

  getAllCategories(): Observable<any[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http
        .get<any>(`${this.apiUrl}/categories`)
        .pipe(
          map((response) => response.collection),
          shareReplay(1) // cache the result
        );
    }
    return this.categoriesCache$;
  }
    // Call this after add or delete
  reloadCategories() {
    this.refresh$.next();
  }
  refreshCategories(): Observable<any[]> {
    this.categoriesCache$ = undefined;
    return this.getAllCategories();
  }

  addCategory(category: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(`${this.apiUrl}/categories`, category, { headers });
  }

  editCategory(category: FormData, catId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put(`${this.apiUrl}/categories/${catId}`, category, {
      headers,
    });
  }

  deleteCategory(catId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(`${this.apiUrl}/categories/${catId}`, {
      headers,
    });
  }
}
