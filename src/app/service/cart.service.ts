import { Injectable, HostListener, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService implements OnInit {
  ngOnInit(): void {
    this.getCart();
  }
  totalprice: number = 0;
  private cart: { product: any; quantity: number }[] = [];
  getCart(): { product: any; quantity: number }[] {
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
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  addToCart(product: any): void {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id
    );
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.updateTotalPriceAndQuantity();
    this.updateLocalStorage();
  }

  removeFromCart(product: any): void {
    const index = this.cart.findIndex((item) => item.product.id === product.id);
    if (index !== -1) {
      const item = this.cart[index];
      if (item.quantity > 1) {
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
      existingItem.quantity++;
      this.updateTotalPriceAndQuantity();
      this.updateLocalStorage();
    }
  }

  decreaseQuantity(product: any): void {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id
    );
  
    if (existingItem && existingItem.quantity > 0) {
      existingItem.quantity--;
      this.updateTotalPriceAndQuantity();
      this.updateLocalStorage();
      const index = this.cart.findIndex(
        (item) => item.product.id === product.id
      );
      if (index !== -1) {
        const item = this.cart[index];
        if (item.quantity == 0) { // Corrected the condition here
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
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  private updateLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
}
