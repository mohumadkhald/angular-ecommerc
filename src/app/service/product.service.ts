import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { PaginatedResponse, Product } from "../interface/product";
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = configService.getApiUri();
   }

  // getProducts(subCategoryName: string, sortBy: string, sortDirection: string, minPrice: number, maxPrice: number, page: number, pageSize: number, colors: string[], sizes: string[]): Observable<PaginatedResponse<Product[]>> {
  //   return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/product-category/${subCategoryName}`, {
  //     params: {
  //       sortBy: sortBy,
  //       sortDirection: sortDirection,
  //       minPrice: minPrice.toString(),
  //       maxPrice: maxPrice.toString(),
  //       page: page.toString(),
  //       pageSize: pageSize.toString(),
  //     }
  //   }).pipe(
  //     map(response => response)
  //   );
  // }

  getProducts(subCategoryName: string, sortBy: string, sortDirection: string, minPrice: number, maxPrice: number, page: number, pageSize: number, colors: string[], sizes: string[], available: any): Observable<PaginatedResponse<Product[]>> {
    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection)
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      if (available !== null) {
        params = params.set('available', available.toString());
      }

  
    colors.forEach(color => {
      params = params.append('color', color);
    });
  
    sizes.forEach(size => {
      params = params.append('size', size);
    });
  
    return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/products/product-category/${subCategoryName}`, { params })
      .pipe(map(response => response));
  }
  
  
  
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  addProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, formData);
  }

  editProduct(formData: FormData, id: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, formData);
  }

  
  getProductsByCategoryAndProductName(categoryName: string, productName: string, sortBy: string, sortDirection: string, minPrice: number, maxPrice: number, page: number, pageSize: number, colors: string[], sizes: string[]): Observable<PaginatedResponse<Product[]>>  {
    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection)
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    colors.forEach(color => {
      params = params.append('color', color);
    });
  
    sizes.forEach(size => {
      params = params.append('size', size);
    });
  
    return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/products/${categoryName}/${productName}`, { params });
  }
  
  getProductsByCreatedBy(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/find/created-by`).pipe(map(response => response));
  }
}

