import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OrdersService } from '../../dashboard-service/orders.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ShowOrderComponent } from '../show-order/show-order.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [SidebarComponent, CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent {
  orders: any[] = []; // Define your order type if you have one
  isDialogOpen: any;

  constructor(
    private orderService: OrdersService,
    private dialog: MatDialog,
    private modalService: NgbModal,
    public toastService: ToastService
  ) {}

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
    const modalRef = this.modalService.open(ShowOrderComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false,    // Prevent closing with the Esc key
    });
  
    modalRef.componentInstance.order = order; // Pass the order data to the modal
    // console.log(order);
  
    modalRef.result.then(
      (result) => {},
      (reason) => {}
    );
  }
  

  updateOrderStatus(order: any, status: string): void {
    // Implement the logic to update order status
    order.status = status;
    this.orderService.updateOrder(order).subscribe(
      () => {
        // console.log('Order status updated');
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
          this.orders = this.orders.filter((order) => order.id !== orderId);
        },
        (error) => {
          console.error('Error deleting order', error);
        }
      );
    }
  }
}
