import { Injectable, HostListener, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl: string;
  totalprice: number = 0;
  private cart: { product: any }[] = [];
  totalpriceDiscount: number = 0;
  private countSubject: BehaviorSubject<number> = new BehaviorSubject<number>(
    0,
  );
  public count$: Observable<number> = this.countSubject.asObservable();
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router,
  ) {
    this.apiUrl = configService.getApiUri();
  }

  getCart(): { product: any }[] {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cart = JSON.parse(storedCart);
      this.updateTotalPrice();
      this.updateCount(); // 🔹 notify subscribers
    }
    return this.cart;
  }

  private updateCount(): void {
    this.countSubject.next(this.cart.length);
  }

  getTotalPrice(): number {
    return this.totalprice;
  }

  private updateTotalPrice(): void {
    this.totalprice = this.cart.reduce(
      (total, item) => total + item.product.price * item.product.quantity,
      0,
    );
  }

  private updateTotalDiscountedPrice(): void {
    console.log('updating total discounted price');
    this.totalpriceDiscount = this.cart.reduce(
      (total, item) =>
        total + item.product.discountedPrice * item.product.quantity,
      0,
    );
    console.log(
      'the total discounted price after calculation: ',
      this.totalpriceDiscount,
      this.cart,
    );
  }

  getTotalDiscountedPrice(): number {
    this.updateTotalDiscountedPrice();
    console.log('the total discounted price: ', this.totalpriceDiscount);
    return this.totalpriceDiscount;
  }
addToCart(product: any): void {
  console.log('The product trying to add:', product);

  const existingItem = this.cart.find(
    (item) =>
      item.product.productId === product.productId &&
      item.product.size === product.size &&
      item.product.color === product.color,
  );

  console.log('Existing product in cart:', existingItem);

  if (existingItem) {
    existingItem.product.quantity += product.quantity;
  } else {
    this.cart.push({ product });
  }

  this.updateTotalPriceAndQuantity();
  this.updateLocalStorage();
  this.updateCount(); // 🔹 Notify subscribers about count change
}


  removeFromCart(product: any): void {
    const index = this.cart.findIndex((item) => item.product.id === product.id);
    if (index !== -1) {
      const item = this.cart[index];
      if (item.product.quantity > 1) {
        this.cart.splice(index, 1);
      } else {
        this.cart.splice(index, 1);
      }
      this.updateLocalStorage();
    }
  }
  increaseQuantity(product: any): void {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id,
    );

    if (existingItem) {
      existingItem.product.quantity++;
      this.updateTotalPriceAndQuantity();
      this.updateLocalStorage();
    }
  }

  decreaseQuantity(product: any): void {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id,
    );

    if (existingItem && existingItem.product.quantity > 0) {
      existingItem.product.quantity--;
      this.updateTotalPriceAndQuantity();
      this.updateLocalStorage();
      const index = this.cart.findIndex(
        (item) => item.product.id === product.id,
      );
      if (index !== -1) {
        const item = this.cart[index];
        if (item.product.quantity == 0) {
          // Corrected the condition here
          this.cart.splice(index, 1);
        }
        this.updateLocalStorage();
      }
    }
  }

  clearCart(): void {
    this.cart = [];
    this.updateTotalPriceAndQuantity();
    this.updateLocalStorage();
  }

  getLocalItemCount(): number {
    return this.cart.length;
  }

  private updateTotalPriceAndQuantity(): void {
    this.totalprice = this.cart.reduce(
      (total, item) => total + item.product.price * item.product.quantity,
      0,
    );
  }

  private updateLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  syncCartFromLocalStorage(): void {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      let cartItems = JSON.parse(storedCart);

      // Map each item to include productId, color, size, quantity, and price
      cartItems = cartItems.map(
        (item: {
          product: {
            productId: any;
            color: any;
            size: any;
            quantity: any;
            price: any;
          };
        }) => ({
          productId: item.product.productId,
          color: item.product.color,
          size: item.product.size,
          quantity: item.product.quantity,
          price: item.product.price,
        }),
      );

      // Check if the cart is not empty
      if (cartItems.length > 0) {
        // Get JWT token from AuthService
        const jwtToken = this.authService.getToken();

        // Prepare headers with Authorization token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        });

        // Make HTTP POST request to sync cart
        this.http
          .post<void>(`${this.apiUrl}/cart/sync`, cartItems, { headers })
          .subscribe(
            () => {
              localStorage.removeItem('cart');
              // Redirect to cart page after successful sync
              this.router.navigate(['/cart']);
            },
            (error) => {
              console.error('Error syncing cart:', error);
            },
          );
      } else {
        console.warn('Cart is empty, not syncing.');
      }
    }
  }
}
