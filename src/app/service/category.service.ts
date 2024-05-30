import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<any[]> {
    return this.http.get<any>('http://ec2-54-167-172-156.compute-1.amazonaws.com:8080/api/categories/all')
      .pipe(map(response => response.collection));
  }

  getAllSubCategories(): Observable<any[]> {
    return this.http.get<any>('http://ec2-54-167-172-156.compute-1.amazonaws.com:8080/api/sub-categories/all')
      .pipe(map(response => response.collection));
  }
}
