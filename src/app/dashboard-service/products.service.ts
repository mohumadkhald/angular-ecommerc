import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Prod } from '../interface/product-all-details';
import { AuthService } from '../service/auth.service';
import { PaginatedResponse, Product } from '../interface/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = 'http://ec2-13-245-232-27.af-south-1.compute.amazonaws.com:8080/api/products';
  private token = this.authService.getToken();

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllProducts(sortBy: string, sortDirection: string, minPrice: number, maxPrice: number, page: number, pageSize: number, searchQuery: string): Observable<any> {
    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection)
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      params = params.set('email', searchQuery);
  
    return this.http.get<any>(`${this.apiUrl}`, { params })
      .pipe(map(response => response));
  }
  

  deleteProduct(prodId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${prodId}`, { headers });
  }

  deleteProducts(productIds: number[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const params = new HttpParams().set('productIds', productIds.join(','));

    return this.http.delete<any>(`${this.apiUrl}/bulk-delete`, { headers, params });
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

  setDiscount(productIds: number[], discount: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const url = `${this.apiUrl}/setDiscount?productIds=${productIds}&discount=${discount}`;
    return this.http.patch(url, { headers });
  }
}
