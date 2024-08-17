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

  onImageSelected(event: any, index: number) {
    const file = event.target.files[0] as File;
    if (file) {
      this.variations[index].image = file;
    }
  }

  saveVariations(form: NgForm) {
    this.formSubmitted = true;
    this.serverErrors = {}; // Clear previous errors
  
    // Check if all variations have an image
    if (this.variations.some(v => !v.image)) {
      return; // Prevent form submission if any variation is missing an image
    }
  
    const formData = new FormData();
  
    // Append specs data as JSON
    formData.append('specs', JSON.stringify(this.variations.map(v => ({
      size: v.size,
      color: v.color,
      quantity: v.quantity
    }))));
  
    // Append images data
    this.variations.forEach((variation, i) => {
      if (variation.image) {
        formData.append(`images[${i}]`, variation.image, variation.image.name);
      }
    });
  
    this.productService.updateProductVariations(this.productId, formData)
      .subscribe(
        response => {
          this.variationAdded.emit();
          this.activeModal.close('added');
        },
        error => {
          if (error.status === 400 && error.error) {
            this.serverErrors = error.error;
          } else {
            console.error('An unexpected error occurred:', error);
          }
        }
      );
  }
  
  onClose() {
    this.activeModal.dismiss('cancel');
  }
}