import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ConfigService } from '../config.service';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  baseUrl: string = '';

  constructor(private http: HttpClient, private authService: AuthService,
    private configService: ConfigService) {
      this.baseUrl = configService.getApiUri();
  }
  private token = this.authService.getToken(); // Replace with your actual token

  getAllOrders(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `${this.token}`, // Replace with your actual token
    });

    return this.http.get<any[]>(`${this.baseUrl}/orders`, { headers }).pipe(map(response => response));
  }

  updateOrder(order: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${order.id}`, order);
  }

  deleteOrder(orderId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.delete<any>(`${this.baseUrl}/orders/${orderId}`, { headers });
  }
}
