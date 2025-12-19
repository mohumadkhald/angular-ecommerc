import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem } from '../interface/cat';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
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

  private countSubject: BehaviorSubject<number | null> = new BehaviorSubject<
    number | null
  >(null);
  public count$: Observable<number | null> = this.countSubject.asObservable();

  setCount(count: number): void {
    this.countSubject.next(count);
  }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/cart`).pipe(
      tap((res) => {
        this.cartItems = res;
        this.setCount(this.cartItems.length);
      })
    );
  }

  getTotalPrice(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );
  }

  getTotalDiscountedPrice(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.totalPriceDiscounted,
      0
    );
  }

  addToCart(product: any): void {
    // Get JWT token from AuthService
    const jwtToken = this.authService.getToken();

    // Prepare headers with Authorization token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    });

    // Make HTTP POST request to add product to cart
    this.http.post<void>(`${this.apiUrl}/cart`, product, { headers }).subscribe(
      (res) => {
        this.cartItems.length++;
      },
      (error) => {}
    );
  }

deleteItem(itemId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/cart/${itemId}`);
}

  increaseQuantity(itemId: number) {
    const params = new HttpParams().set('state', 'INCREASE');

    return this.http.patch(
      `${this.apiUrl}/cart/${itemId}`,
      {},
      { params, responseType: 'text' }
    );
  }

  decreaseQuantity(itemId: number, qty: number): any {
    if (qty <= 1) {
      return this.deleteItem(itemId);
    }

    const params = new HttpParams().set('state', 'DECREASE');
    return this.http.patch(
      `${this.apiUrl}/cart/${itemId}`,
      {},
      { params, responseType: 'text' }
    );
  }

  clearCart() {
    // Make HTTP DELETE request to clear the cart
    this.http.delete<void>(`${this.apiUrl}/cart`).subscribe(
      (res) => {
        // Clear the local cartItems array using splice
        this.cartItems.splice(0, this.cartItems.length);
      },
      (error) => {}
    );
  }

  getCountOfItems(): number {
    return this.cartItems.length;
  }
}
