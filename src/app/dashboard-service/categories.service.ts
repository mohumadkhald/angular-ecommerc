import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../config.service';

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

  getAllCategories(): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/categories`)
      .pipe(map((response) => response.collection));
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

    return this.http.put(`${this.apiUrl}/categories/${catId}`, category, { headers });
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
