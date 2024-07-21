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

  getProducts(subCategoryName: string, sortBy: string, sortDirection: string, minPrice: number, maxPrice: number, page: number, pageSize: number): Observable<PaginatedResponse<Product[]>> {
    return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/product-category/${subCategoryName}`, {
      params: {
        sortBy: sortBy,
        sortDirection: sortDirection,
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        page: page.toString(),
        pageSize: pageSize.toString()
      }
    }).pipe(
      map(response => response)
    );
  }
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  addProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, formData);
  }

  
  getProductsByCategoryAndProductName(categoryName: string, productName: string, page: number, pageSize: number): Observable<PaginatedResponse<Product[]>> {
    let params = new HttpParams()
      .set('categoryName', categoryName)
      .set('productName', productName)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<Product[]>>(`${this.apiUrl}/${categoryName}/${productName}?page=${page}&pageSize=${pageSize}`)
      .pipe(
        map(response => response)
      );
  }

  getProductsByCreatedBy(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/find/created-by`).pipe(map(response => response));
  }
}

