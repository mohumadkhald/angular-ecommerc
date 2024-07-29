// cart.component.ts
import { CommonModule, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '../../interface/cat';
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { ToastService } from '../../service/toast.service';
import { ExpiredSessionDialogComponent } from '../expired-session-dialog/expired-session-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgFor, CommonModule, RouterLink],
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: { product: any }[] = [];
  totalprice: number = 0;
  shipping: number = 20;
  counter: number = 0;
  cartItems1: CartItem[] = [];
  private authSubscription!: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private cartServerService: CartServerService,
    public toastService: ToastService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.updateTotalPrice();
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          this.loadCartItems();
        } else {
          this.cartItems = this.cartService.getCart();
          this.updateTotalPrice();
        }
      }
    );
  }
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  private loadCartItems(): void {
    this.cartServerService.getCart().subscribe(
      (items) => {
        this.cartItems1 = items;
      },
      (error) => {}
    );
  }

  showExpiredSessionDialog(message: string, path: string): void {
    this.dialog.open(ExpiredSessionDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message, path: path },
    });
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
    if (this.auth()) {
      this.cartServerService.deleteItem(itemID);
      this.loadCartItems()
    }
  }

  removeFromCart(product: any): void {
    this.cartService.removeFromCart(product);
    this.cartItems = this.cartService.getCart();
  }
  getCountOfItems() {
    if (this.auth()) {
      return this.cartServerService.getCountOfItems();
    }
    return this.cartService.getCountOfItems();
    
  }

  clearCart(): void {
    if (this.auth()) {
      this.cartServerService.clearCart();
      this.loadCartItems()
    }
    this.cartService.clearCart();
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  removeToast(): void {
    this.toastService.remove();
  }

  showToast(): void {
    this.toastService.add('This is a toast message.');
  }
}
