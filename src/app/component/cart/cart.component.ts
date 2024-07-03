// cart.component.ts
import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { CartItem } from '../interface/cat';

@Component({
  standalone: true,
  imports: [NgFor,CommonModule, RouterLink],
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartItems: { product: any; }[] = [];
  totalprice: number = 0;
  shipping: number = 20;
  counter: number = 0;
  cartItems1: CartItem[] = [];

  constructor(private cartService: CartService,
              private authService: AuthService,
              private cartServerService: CartServerService,
    ) {
    this.updateTotalPrice();
  }

  ngOnInit(): void {
    if (this.auth()) {
      this.cartServerService.getCart().subscribe(
        (items) => {
          this.cartItems1 = items;
          console.log(this.cartItems1)
        },
        (error) => {
          console.error('Error fetching cart:', error);
        }
      );
    } else {
      this.cartItems = this.cartService.getCart();
      this.updateTotalPrice();
    }
  }

  private updateTotalPrice(): void {
    this.totalprice = this.cartService.getTotalPrice();
  }

  increaseQuantity(product: any): void {
    this.cartService.increaseQuantity(product);
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }

  decreaseQuantity(product: any): void {
    this.cartService.decreaseQuantity(product);
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }
  removeItemCart(itemID: any): void {
    if(this.auth()){
      this.cartServerService.deleteItem(itemID);
      this.cartServerService.getCart().subscribe(
        (items) => {
          this.cartItems1 = items;
          console.log(this.cartItems1)
        },
        (error) => {
          console.error('Error fetching cart:', error);
        }
      );
    }
  }

  removeFromCart(product: any): void {
    this.cartService.removeFromCart(product);
    this.cartItems = this.cartService.getCart();
  }
  getCountOfItems() {
    if(this.auth())
      {
        return this.cartServerService.getCountOfItems();
      }
    return this.cartService.getCountOfItems();
  }

  clearCart(): void {
    if(this.auth()){
      this.cartServerService.clearCart();
      this.cartServerService.getCart().subscribe(
        (items) => {
          this.cartItems1 = items;
          console.log(this.cartItems1)
        },
        (error) => {
          console.error('Error fetching cart:', error);
        }
      );
    }
    this.cartService.clearCart();
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }

  

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

}
