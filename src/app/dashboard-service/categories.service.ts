import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private apiUrl = 'https://ec2-13-247-87-159.af-south-1.compute.amazonaws.com:8443/api/categories';

  constructor(private http: HttpClient, private authService: AuthService) { }
  token: string | null = this.authService.getToken()

  getAllCategories(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl)
      .pipe(map(response => response.collection));
  }

  addCategory(category: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.post(this.apiUrl, category, { headers });
  }
  
  deleteCategory(catId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${catId}`, { headers });
  }

}
