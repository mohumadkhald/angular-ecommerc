import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem } from '../interface/cat';
import { AuthService } from './auth.service';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class CartServerService implements OnInit {

  apiUrl: string;
  cartItems: CartItem[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService
  ) {
    this.apiUrl = configService.getApiUri();
  }


  ngOnInit(): void {
    this.getCart().subscribe();
  }

  private countSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  public count$: Observable<number | null> = this.countSubject.asObservable();

  setCount(count: number): void {
    this.countSubject.next(count);
  }

  
  getCart(): Observable<CartItem[]> {
    const jwtToken = this.authService.getToken();
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    });
    
    return this.http.get<CartItem[]>(`${this.apiUrl}/cart`, { headers }).pipe(
      tap((res) => {
        this.cartItems = res;
        this.setCount(this.cartItems.length);
      })
    );
  }
  
  addToCart(product: any): void {
    // Get JWT token from AuthService
    const jwtToken = this.authService.getToken();
    
    // Prepare headers with Authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    });
    
    // Make HTTP POST request to add product to cart
    this.http.post<void>(`${this.apiUrl}/cart`, product, { headers }).subscribe(
      (res) => {
        console.log(res);
        this.cartItems.length++
      },
      (error) => {
      }
    );
  }

  deleteItem(itemId: any) {
    // Get JWT token from AuthService
    const jwtToken = this.authService.getToken();
  
    // Prepare headers with Authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    });
  
    // Make HTTP DELETE request to remove the item from the cart
    this.http.delete<void>(`${this.apiUrl}/cart/${itemId}`, { headers }).subscribe(
      (res) => {
        // Log the response
        console.log(`${this.apiUrl}/${itemId}`);
  
        // Find the index of the item in the local cartItems array
        const index = this.cartItems.findIndex(item => item.itemID === itemId);
  
        // If the item is found, remove it from the local cartItems array
        if (index !== -1) {
          this.cartItems.splice(index, 1);
        }
  
      },
      (error) => {
      }
    );
  }
  

  clearCart() {
    // Get JWT token from AuthService
    const jwtToken = this.authService.getToken();
  
    // Prepare headers with Authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    });
  
    // Make HTTP DELETE request to clear the cart
    this.http.delete<void>(`${this.apiUrl}/cart`, { headers }).subscribe(
      (res) => {
        
        // Clear the local cartItems array using splice
        this.cartItems.splice(0, this.cartItems.length);

      },
      (error) => {
      }
    );
  }
  
  getCountOfItems(): number {
    return this.cartItems.length;
  }
}

