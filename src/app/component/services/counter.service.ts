// quantity.service.ts

import { Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { CartItem } from '../interface/cat';

@Injectable({
  providedIn: 'root',
})
export class QuantityService {
  quantity: any = 0;
  items !: CartItem[]; // Specify the type as CartItem[]
  count: number = 0;
    cart: any;
  constructor(private cartServices: CartService) {}
  getTotalQuantity(): void {
   return this.getCart()
  }
  getCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cart = JSON.parse(storedCart);
      const totalQuantity = this.cart.reduce((sum: any, item: { quantity: any; }) => sum + item.quantity, 0);
      // console.log(totalQuantity);
      return totalQuantity;
    }
}
  

}
