import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Counts {
  users: number;
  subCategories: number;
  products: number;
  categories: number;
  orders: number;
}
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  apiUrl: any = 'http://localhost:8080/api';

  private countsSource = new BehaviorSubject<Counts>({
    categories: 0,
    subCategories: 0,
    users: 0,
    products: 0,
    orders: 0,
  });

  counts$ = this.countsSource.asObservable();

  constructor(private http: HttpClient) {}

  // Load counts from backend
  loadCounts() {
    this.http.get<Counts>(`${this.apiUrl}/counts`)
      .subscribe(counts => this.countsSource.next(counts));
  }



  // Call this after any add/edit/delete
  refreshCounts() {
    this.loadCounts();
  }
}
