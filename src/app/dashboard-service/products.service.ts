import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Prod } from '../interface/product-all-details';
import { AuthService } from '../service/auth.service';
import { PaginatedResponse, Product } from '../interface/product';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl: string;
  private token = this.authService.getToken();

  constructor(private http: HttpClient, private authService: AuthService, private configService: ConfigService) {
    this.apiUrl = configService.getApiUri();
   }

  getAllProducts(sortBy: string, sortDirection: string, minPrice: number, maxPrice: number, colors: string[], sizes: string[], page: number, pageSize: any, emailQuery: string, subCat: string, nameQuery: string, available: any): Observable<any> {
    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection)
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
      params = params.set('email', emailQuery);
      params = params.set('subCategory', subCat);
      params = params.set('productTitle', nameQuery);
      colors.forEach(color => {
        params = params.append('color', color);
      });
    
      sizes.forEach(size => {
        params = params.append('size', size);
      });
      if (available !== null) {
        params = params.set('available', available.toString());
      }
  
    return this.http.get<any>(`${this.apiUrl}/products`, { params })
      .pipe(map(response => response));
  }
  

  deleteProduct(prodId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/products/${prodId}`, { headers });
  }

  deleteProducts(productIds: number[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const params = new HttpParams().set('productIds', productIds.join(','));

    return this.http.delete<any>(`${this.apiUrl}/products/bulk-delete`, { headers, params });
  }

  getProductDetails(prodId: number): Observable<Prod> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/products/allDetails/${prodId}`, { headers });
  }

  
  addProduct(product: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/products`, product, { headers });
  }
  
  updateProductVariations(productId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${productId}/stock`, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    });
  }
  

  setDiscount(productIds: number[], discount: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const url = `${this.apiUrl}/products/setDiscount?productIds=${productIds}&discount=${discount}`;
    return this.http.patch(url, { headers });
  }

  getEmailsSellers() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/products/emails`, { headers });
  }
}
