import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-add-to-cart-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
  ],
  templateUrl: './add-to-cart-modal.component.html',
  styleUrl: './add-to-cart-modal.component.css',
  animations: [
    trigger('dialogOpen', [
      transition('enter => leave', [
        animate(
          '1000ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8)' })
        ),
      ]),
      transition('void => enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate(
          '1500ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
    ]),

    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '1500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('buttonAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate(
          '1000ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.5)' })
        ),
      ]),
    ]),
  ],
})
export class AddToCartModalComponent {
  @Input() product: any;

  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  submitted = false;

  availableColors: string[] = [];
  sizes: string[] = [];
  colors: string[] = [];
  maxQuantity = 0;
  availableSizes: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddToCartModalComponent>,
    private cartService: CartService,
    private authService: AuthService,
    private cartServerService: CartServerService
  ) {}

  ngOnInit(): void {
    this.availableSizes = [
      ...Array.from(
        new Set(
          this.product.productVariations
            .filter((v: any) => v.quantity > 0)
            .map((v: any) => v.size as string)
        )
      ),
    ] as string[];
  }

  onSizeChange(selectedSize: string): void {
    this.selectedSize = selectedSize;

    // Filter colors based on selected size and stock
    this.availableColors = this.product.productVariations
      .filter(
        (v: { size: string; quantity: number }) =>
          v.size === selectedSize && v.quantity > 0
      )
      .map((v: { color: any }) => v.color);

    // Reset color and quantity
    this.selectedColor = '';
    this.maxQuantity = 0;
  }

  onColorChange(): void {
    const variation = this.product.productVariations.find(
      (v: { color: string; size: string }) =>
        v.color === this.selectedColor && v.size === this.selectedSize
    );

    this.maxQuantity = variation ? variation.quantity : 0;
  }

  validateQuantity(): boolean {
    return this.quantity <= this.maxQuantity;
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  isClosing = false;

  close(x: string) {
    // Start animation
    this.isClosing = true;

    // Wait 1 second (animation duration) then close
    setTimeout(() => {
      this.dialogRef.close(x);
    }, 1000); // match your leave animation duration
  }

  addToCart() {
    this.submitted = true;

    if (
      !this.selectedSize ||
      !this.selectedColor ||
      this.quantity <= 0 ||
      !this.validateQuantity()
    ) {
      return; // Validation failed
    }

    const productToAdd = {
      productId: this.product.productId,
      title: this.product.productTitle,
      imageUrl: this.product.imageUrls[0],
      size: this.selectedSize,
      color: this.selectedColor,
      quantity: this.quantity,
      price: this.product.price,
      discount: this.product.discountPercent,
      discountedPrice: this.product.discountPrice,
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
    } else {
      console.log('Adding to cart server-side', this.product);
      console.log('Adding to server cart: ', productToAdd);
      this.cartServerService.addToCart(productToAdd);
    }

    this.close('added');
  }
}
