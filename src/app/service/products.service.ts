import { HttpClient } from '@angular/common/http';
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
    return this.http.get<PaginatedResponse>(`${this.apiUrl}/product-category/${subCategoryName}`)
      .pipe(
      map(response => response.content)
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
