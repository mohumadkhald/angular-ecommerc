import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem } from '../component/interface/cat';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartServerService implements OnInit {

  apiUri = "http://127.0.0.1:8080/api/cart";
  cartItems: CartItem[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


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
    
    return this.http.get<CartItem[]>(this.apiUri, { headers }).pipe(
      tap((res) => {
        this.cartItems = res;
        this.setCount(this.cartItems.length);
        console.log('Cart data:', this.cartItems);
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
    this.http.post<void>(this.apiUri, product, { headers }).subscribe(
      (res) => {
        console.log(res);
        this.cartItems.length++
        console.log(this.cartItems.length)
      },
      (error) => {
        console.error('Error adding product to cart:', error);
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
    this.http.delete<void>(`${this.apiUri}/${itemId}`, { headers }).subscribe(
      (res) => {
        // Log the response
        console.log(`${this.apiUri}/${itemId}`);
  
        // Find the index of the item in the local cartItems array
        const index = this.cartItems.findIndex(item => item.itemID === itemId);
  
        // If the item is found, remove it from the local cartItems array
        if (index !== -1) {
          this.cartItems.splice(index, 1);
        }
  
        // Log the updated cartItems array
        console.log('Updated cart data:', this.cartItems);
      },
      (error) => {
        console.error('Error removing product from cart:', error);
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
    this.http.delete<void>(this.apiUri, { headers }).subscribe(
      (res) => {
        console.log('Cart cleared on server:', res);
        
        // Clear the local cartItems array using splice
        this.cartItems.splice(0, this.cartItems.length);
        
        // Log the updated cartItems array
        console.log('Local cart data cleared:', this.cartItems);
      },
      (error) => {
        console.error('Error clearing cart:', error);
      }
    );
  }
  
  getCountOfItems(): number {
    return this.cartItems.length;
  }
}
