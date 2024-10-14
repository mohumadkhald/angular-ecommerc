import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OrdersService } from '../../dashboard-service/orders.service';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [SidebarComponent, CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  orders: any[] = []; // Define your order type if you have one

  constructor(private orderService: OrdersService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(
      (data: any[]) => {
        this.orders = data;
      },
      (error) => {
        console.error('Error fetching orders', error);
      }
    );
  }

  viewOrderDetails(order: any): void {
    // Implement the logic to open a modal with order details
    // You could use MatDialog to show the order details
  }

  updateOrderStatus(order: any, status: string): void {
    // Implement the logic to update order status
    order.status = status;
    this.orderService.updateOrder(order).subscribe(
      () => {
        console.log('Order status updated');
      },
      (error) => {
        console.error('Error updating order status', error);
      }
    );
  }

  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe(
        () => {
          this.orders = this.orders.filter(order => order.id !== orderId);
          console.log('Order deleted successfully');
        },
        (error) => {
          console.error('Error deleting order', error);
        }
      );
    }
  }
}
