import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  getSubCategoriesByCategoryTitle(categoryTitle: string): Observable<any> {
    return this.http.get<any>(`https://ec2-13-247-87-159.af-south-1.compute.amazonaws.com:8443/api/sub-categories/find/${categoryTitle}`).pipe(
      map(response => response.collection)
    );
  }

  constructor(private http: HttpClient, private router: Router) { }

  getAllCategories(): Observable<any[]> {
    return this.http.get<any>('https://ec2-13-247-87-159.af-south-1.compute.amazonaws.com:8443/api/categories')
      .pipe(map(response => response.collection));
  }

  getAllSubCategories(): Observable<any[]> {
    return this.http.get<any>('https://ec2-13-247-87-159.af-south-1.compute.amazonaws.com:8443/api/sub-categories')
      .pipe(map(response => response.collection));
  }
}
