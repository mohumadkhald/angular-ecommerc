import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { OrdersService } from '../../service/orders.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  orders: any[] = [];
  private authSubscription!: Subscription;

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          this.loadOrders();
        }
      }
    );
  }

  getItemTotal(item: any): number {
    return item.productVariations.reduce((sum: number, v: any) => {
      return sum + (item.price) * v.quantity * (1 - item.discount / 100);
    }, 0);
  }

  loadOrders(): void {
    this.ordersService.getUserOrders().subscribe(
      (data) => {
        this.orders = data;
        console.log(this.orders);
      },
      (error) => {
        console.error('Failed to fetch user orders', error);
      }
    );
  }
}
