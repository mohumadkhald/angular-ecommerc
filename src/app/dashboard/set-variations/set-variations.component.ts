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
  styleUrl: './set-variations.component.css'
})
export class SetVariationsComponent {
  @Input() productId!: number;
  @Output() variationAdded = new EventEmitter<void>();

  sizes: string[] = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];
  colors: string[] = ['red', 'blue', 'green', 'black', 'white'];

  variations: Variation[] = [{ size: '', color: '', quantity: 0 }];
  formSubmitted = false;
  serverErrors: any = {}; // To store server-side error messages

  constructor(private productService: ProductsService, public activeModal: NgbActiveModal) {}

  addVariation() {
    this.variations.push({ size: '', color: '', quantity: 0 });
  }

  removeVariation(index: number) {
    if (this.variations.length > 1) {
      this.variations.splice(index, 1);
    }
  }

  saveVariations(form: NgForm) {
    this.formSubmitted = true;
    this.serverErrors = {}; // Clear previous errors

      this.productService.updateProductVariations(this.productId, this.variations)
        .subscribe(
          response => {
            this.variationAdded.emit();
            this.activeModal.close('added');
          },
          error => {
            if (error.status === 400 && error.error) {
              this.serverErrors = error.error;
            } else {
            }
          }
        );
    
  }

  onClose() {
    this.activeModal.dismiss('cancel');
  }
}