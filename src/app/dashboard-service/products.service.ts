import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Prod } from '../interface/product-all-details';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = 'http://localhost:8080/api/products';
  private token = localStorage.getItem('token');

  constructor(private http: HttpClient) { }

  getAllProducts(page: number, pageSize: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;

    return this.http.get<any>(url, { headers });
  }
  deleteProduct(prodId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${prodId}`, { headers });
  }

  getProductDetails(prodId: number): Observable<Prod> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/allDetails/${prodId}`, { headers });
  }

  
  addProduct(product: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, product, { headers });
  }
  
  updateProductVariations(productId: number, variations: any[]): Observable<any> {
    const url = `${this.apiUrl}/${productId}/stock`;
    return this.http.put(url, variations);
  }
}
