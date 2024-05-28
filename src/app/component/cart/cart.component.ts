// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CommonModule, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [NgFor,CommonModule, RouterLink],
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartItems: { product: any; quantity: number }[] = [];
  totalprice: number = 0;
  shipping: number = 20;
  counter: number = 0;

  constructor(private cartService: CartService) {
    this.updateTotalPrice();
  }

  ngOnInit(): void {
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
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
  removeFromCart(product: any): void {
    this.cartService.removeFromCart(product);
    this.cartItems = this.cartService.getCart();
  }
  getCountOfItems() {
    return this.cartService.getCountOfItems();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }
}