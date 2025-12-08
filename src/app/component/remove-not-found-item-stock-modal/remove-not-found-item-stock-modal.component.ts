import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { ConfigService } from '../../service/config.service';

@Component({
  selector: 'app-remove-not-found-item-stock-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remove-not-found-item-stock-modal.component.html',
  styleUrl: './remove-not-found-item-stock-modal.component.css',
})
export class RemoveNotFoundItemStockModalComponent {
  @Input() productIssues!: any[];
  @Input() cartItemsWithIssues!: any[];
  @Input() paymentInfo!: any;
  @Input() address!: any;
  @Input() numItems!: any;
  baseUrl: any;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpClient,
    private toastService: ToastService,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.getApiUri();
  }
ngOnInit() {
  // Merge product info into each issue
  this.productIssues = this.productIssues.map(issue => {
    const product = this.cartItemsWithIssues.find(item => item.productTitle === issue.title);
    return {
      ...issue,
      product: product ? product : null
    };
  });
}

  close() {
    this.activeModal.close();
  }

  removeItems() {
    const order = {
      status: 'PENDING',
      paymentInfo: this.paymentInfo,
      address: this.address,
      orderDate: new Date().toISOString(),
      deliveryDate: null,
    };

    this.http
      .post(`${this.baseUrl}/orders?removeNotFoundStock=true`, order)
      .subscribe(
        (response) => {
          this.toastService.add(
            'Order resubmitted successfully with unavailable items removed.', 'success'
          );
          this.close();
        },
        (error) => {
          console.log('Error resubmitting order', error);
          this.toastService.add(
            'Error resubmitting order.' + error.error.message, 'error'
          );
          this.close();
        }
      );
  }

  takeAvailable() {
    const order = {
      status: 'PENDING',
      paymentInfo: this.paymentInfo,
      address: this.address,
      orderDate: new Date().toISOString(),
      deliveryDate: null,
    };

    this.http
      .post(`${this.baseUrl}/orders?take=true`, order)
      .subscribe(
        (response) => {
          this.toastService.add(
            'Order resubmitted successfully with unavailable items removed.', 'success'
          );
          this.close();
        },
        (error) => {
          console.log('Error resubmitting order', error);
          this.toastService.add(
            'Error resubmitting order.' + error.error.message, 'error'
          );
          this.close();
        }
      );
  }
}
