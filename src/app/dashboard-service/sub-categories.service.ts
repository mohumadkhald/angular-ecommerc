import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubCategoriesService {
  private apiUrl = 'http://localhost:8080/api/sub-categories';

  constructor(private http: HttpClient, private authService: AuthService) { }
  token: string | null = this.authService.getToken();

  getAllSubCategories(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl)
      .pipe(map(response => response.collection));
  }

  addSubCategory(category: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.post(this.apiUrl, category, { headers });
  }
  
  deleteSubCategory(catId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${catId}`, { headers });
  }
}
