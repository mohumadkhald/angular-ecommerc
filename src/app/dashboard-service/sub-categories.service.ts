import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class SubCategoriesService {
  private apiUrl: string;

  constructor(private http: HttpClient, private authService: AuthService, private configService: ConfigService) {
    this.apiUrl = configService.getApiUri();
   }
  token: string | null = this.authService.getToken();

  getAllSubCategories(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/sub-categories`)
      .pipe(map(response => response.collection));
  }

  addSubCategory(category: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.post(`${this.apiUrl}/sub-categories`, category, { headers });
  }

  editSubCategory(category: FormData, subCatId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.put(`${this.apiUrl}/sub-categories/${subCatId}`, category, { headers });
  }
  
  
  deleteSubCategory(catId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/sub-categories/${catId}`, { headers });
  }
}
