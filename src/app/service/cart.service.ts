import { Injectable, HostListener, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CartService implements OnInit {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.getCart();
  }
  totalprice: number = 0;
  apiUri = "https://ec2-13-247-87-159.af-south-1.compute.amazonaws.com:8443/api/cart/sync";
  private cart: { product: any }[] = [];
  getCart(): { product: any }[] {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cart = JSON.parse(storedCart);
      this.updateTotalPrice();
    }
    return this.cart;
  }

  getTotalPrice(): number {
    return this.totalprice;
  }

  private updateTotalPrice(): void {
    this.totalprice = this.cart.reduce(
      (total, item) => total + item.product.price * item.product.quantity,
      0
    );
  }

  addToCart(product: any): void {
    console.log("the produt try to add: ", product);
    const existingItem = this.cart.find(
      (item) => item.product.productId === product.productId && item.product.size === product.size && item.product.color === product.color
    );
    console.log("the exist product: " ,existingItem)
    if (existingItem) {
      existingItem.product.quantity = existingItem.product.quantity + product.quantity;
    } else {
      this.cart.push({ product});
    }
    this.updateTotalPriceAndQuantity();
    this.updateLocalStorage();
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
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      existingItem.product.quantity++;
      this.updateTotalPriceAndQuantity();
      this.updateLocalStorage();
    }
  }

  decreaseQuantity(product: any): void {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id
    );
  
    if (existingItem && existingItem.product.quantity > 0) {
      existingItem.product.quantity--;
      this.updateTotalPriceAndQuantity();
      this.updateLocalStorage();
      const index = this.cart.findIndex(
        (item) => item.product.id === product.id
      );
      if (index !== -1) {
        const item = this.cart[index];
        if (item.product.quantity == 0) { // Corrected the condition here
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

  getCountOfItems(): number {
    return this.cart.length;
  }

  private updateTotalPriceAndQuantity(): void {
    this.totalprice = this.cart.reduce(
      (total, item) => total + item.product.price * item.product.quantity,
      0
    );
  }

  private updateLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }


  syncCartFromLocalStorage(): void {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      let cartItems = JSON.parse(storedCart);
  
      // Map each item to include productId, color, size, and quantity
      cartItems = cartItems.map((item: { product: { productId: any; color: any; size: any; quantity: any; price: any; }; }) => ({
        productId: item.product.productId,
        color: item.product.color,
        size: item.product.size,
        quantity: item.product.quantity,
        price: item.product.price,
      }));
  
      // Get JWT token from AuthService
      const jwtToken = this.authService.getToken();
      
      // Prepare headers with Authorization token
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      });
      
      // Make HTTP POST request to sync cart
      this.http.post<void>(this.apiUri, cartItems, { headers }).subscribe(
        () => {
          console.log(`Cart synchronized successfully for user`, cartItems);
          localStorage.removeItem('cart');
        },
        (error) => {
          console.error('Error syncing cart:', error);
        }
      );
    }
  }
  
}
