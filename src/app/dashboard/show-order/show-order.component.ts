import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-show-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-order.component.html',
  styleUrl: './show-order.component.css'
})
export class ShowOrderComponent {
  @Input() order: any;
  isDialogOpen!: boolean;
  constructor(
    public activeModal: NgbActiveModal,
  ) {}

  close(): void {
    this.activeModal.close();
  }

    getItemTotal(item: any): number {
    return item.productVariations.reduce((sum: number, v: any) => {
      return sum + v.quantity;
    }, 0);
  }
}
