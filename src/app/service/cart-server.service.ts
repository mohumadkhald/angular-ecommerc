import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem } from '../interface/cat';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class CartServerService {
  apiUrl: string;
  cartItems: CartItem[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.apiUrl = configService.getApiUri();
  }

  private countSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
    0,
  );
  public count$: Observable<number> = this.countSubject.asObservable();

  setCount(count: number): void {
    this.countSubject.next(count);
  }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/cart`).pipe(
      tap((res) => {
        this.cartItems = res;
        this.setCount(this.cartItems.length);
      }),
    );
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  getTotalDiscountedPrice(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.totalPriceDiscounted,
      0,
    );
  }

  addToCart(product: any): void {
    this.http.post<void>(`${this.apiUrl}/cart`, product).subscribe(
      () => {
        // Find if the product already exists in cart
        const existingItem = this.cartItems.find(
          (item) => item.productId === product.productId && item.size === product.size && item.color === product.color,
        );

        if (existingItem) {
          console.log(existingItem)
          // Already in cart → increase quantity
          existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
          // Not in cart → add new item with quantity 1
          this.cartItems.push({ ...product, quantity: 1 });
          this.countSubject.next(this.countSubject.value + 1);
        }
      },
      (error) => {
        console.error('Error adding to cart', error);
      },
    );
  }

  deleteItem(itemId: number): Observable<void> {
    this.countSubject.next(this.countSubject.value - 1);
    return this.http.delete<void>(`${this.apiUrl}/cart/${itemId}`);
  }

  increaseQuantity(itemId: number) {
    const params = new HttpParams().set('state', 'INCREASE');

    return this.http.patch(
      `${this.apiUrl}/cart/${itemId}`,
      {},
      { params, responseType: 'text' },
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
      { params, responseType: 'text' },
    );
  }

  clearCart() {
    // Make HTTP DELETE request to clear the cart
    this.http.delete<void>(`${this.apiUrl}/cart`).subscribe(
      (res) => {
        // Clear the local cartItems array using splice
        this.countSubject.next(0);
        this.cartItems.splice(0, this.cartItems.length);
      },
      (error) => {},
    );
  }

  getCountOfItems(): Observable<number> {
    return this.count$;
  }
}
