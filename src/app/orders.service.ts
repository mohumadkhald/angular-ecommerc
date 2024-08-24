import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private baseUrl = 'http://localhost:8080/api/orders'; // Update the base URL as needed

  constructor(private http: HttpClient, private authService: AuthService) {}
  private token = this.authService.getToken(); // Replace with your actual token

  getAllOrders(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `${this.token}`, // Replace with your actual token
    });

    return this.http.get<any[]>(this.baseUrl, { headers }).pipe(map(response => response));
  }

  updateOrder(order: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${order.id}`, order);
  }

  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${orderId}`);
  }
}
