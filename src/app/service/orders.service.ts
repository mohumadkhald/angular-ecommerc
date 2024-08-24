import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private apiUrl = '';

  constructor(private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService) {
      this.apiUrl = configService.getApiUri();
     }
  private token = this.authService.getToken(); // Replace with your actual token

  getUserOrders(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.token}` // Replace with your actual token
    });

    return this.http.get<any[]>(`${this.apiUrl}/orders/user`, { headers });
  }
}
