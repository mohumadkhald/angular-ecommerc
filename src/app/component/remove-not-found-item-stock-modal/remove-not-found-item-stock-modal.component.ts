import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { ConfigService } from '../../config.service';

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
  baseUrl: any;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpClient,
    private toastService: ToastService,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.getApiUri();
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
          console.log('Order resubmitted successfully', response);
          this.toastService.add(
            'Order resubmitted successfully with unavailable items removed.'
          );
          this.close();
        },
        (error) => {
          console.log('Error resubmitting order', error);
          this.toastService.error(
            'Error resubmitting order.' + error.error.message
          );
          this.close();
        }
      );
  }
}
