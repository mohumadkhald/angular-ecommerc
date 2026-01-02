import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductsService } from '../../dashboard-service/products.service';
import { Variation } from '../../interface/variation';

@Component({
  selector: 'app-set-variations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './set-variations.component.html',
  styleUrl: './set-variations.component.css',
})
export class SetVariationsComponent {
  @Input() productId!: number;
  @Input() color!: string;
  @Input() lastQuantity!: number;
  @Output() variationAdded = new EventEmitter<void>();

  sizes = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];
  colors = ['red', 'blue', 'green', 'black', 'white'];

  variations: Variation[] = [];
  formSubmitted = false;
  serverErrors: Record<string, string> = {};

  constructor(
    private productService: ProductsService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    if (this.color === 'no_color') {
      this.variations = [
        {
          size: '',
          color: '',
          quantity: this.lastQuantity || 1,
        },
      ];
    } else {
      this.variations = [
        {
          size: '',
          color: '',
          quantity: 0,
        },
      ];
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  addVariation() {
    this.variations.push({ size: '', color: '', quantity: 1 });
  }

  removeVariation(index: number) {
    this.variations.splice(index, 1);
  }

  saveVariations(form: NgForm) {
    this.formSubmitted = true;
    if (form.invalid) return;

    const specs = this.variations.map((v) => ({
      size: this.color === 'no_color' ? 'NO_SIZE' : v.size,
      color: this.color === 'no_color' ? 'no_color' : v.color,
      quantity: v.quantity,
    }));

    const formData = new FormData();
    formData.append('specs', JSON.stringify(specs));

    this.productService
      .updateProductVariations(this.productId, formData)
      .subscribe({
        next: () => {
          this.variationAdded.emit();
          this.activeModal.close('added');
        },
        error: (err) => {
          if (err.status === 400) {
            this.serverErrors = err.error;
          }
        },
      });
  }

  onClose() {
    this.activeModal.dismiss();
  }
}
