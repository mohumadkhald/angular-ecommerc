import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {PaginatedResponse, Product} from "../component/interface/product";

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getProducts(subCategoryName: string): Observable<Product[]> {
    return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/product-category/${subCategoryName}`)
      .pipe(
      map(response => response.content)
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  addProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, formData);
  }

  
  getProductsByCategoryAndProductName(categoryName: string, productName: string, page: number = 0, size: number = 5): Observable<PaginatedResponse<Product[]>> {
    let params = new HttpParams()
      .set('categoryName', categoryName)
      .set('productName', productName)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/${categoryName}/${productName}?page=${page}`)
      .pipe(
        map(response => response)
      );
  }

  getProductsByCreatedBy(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/find/created-by`).pipe(map(response => response));
  }
}

