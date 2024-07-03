import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  getSubCategoriesByCategoryTitle(categoryTitle: string) {
    return this.http.get<any>(`http://localhost:8080/api/sub-categories/find/${categoryTitle}`)
     .pipe(map(response => response.collection)
    );

  }

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<any[]> {
    return this.http.get<any>('http://localhost:8080/api/categories/all')
      .pipe(map(response => response.collection));
  }

  getAllSubCategories(): Observable<any[]> {
    return this.http.get<any>('http://localhost:8080/api/sub-categories/all')
      .pipe(map(response => response.collection));
  }
}
