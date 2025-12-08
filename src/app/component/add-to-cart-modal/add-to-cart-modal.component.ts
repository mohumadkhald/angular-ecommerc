import { CommonModule, NgForOf, NgStyle } from "@angular/common";
import { ChangeDetectorRef, Component, Input, NgZone } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-add-to-cart-modal',
  standalone: true,
  imports: [
  FormsModule, NgbModule, NgForOf, NgStyle, CommonModule
  ],
  templateUrl: './add-to-cart-modal.component.html',
  styleUrl: './add-to-cart-modal.component.css'
})

export class AddToCartModalComponent {
  @Input() product: any;
  @Input() haveSpec: boolean = true;

  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;
  submitted: boolean = false;

  availableColors: any;
  sizes: string[] = [];
  maxQuantity: number = 0; // Holds the max available quantity for the selected variation

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthService,
    private cartServerService: CartServerService
  ) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
    // Extract available colors from productVariations with quantity > 0
    this.availableColors = [
      ...new Set(
        this.product.productVariations
          .filter((v: any) => v.quantity > 0)
          .map((v: any) => v.color)
      ),
    ];
  }

  onColorChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const color = selectElement.value;

    // Extract available sizes for the selected color with quantity > 0
    this.sizes = this.product.productVariations
      .filter((v: any) => v.color === color && v.quantity > 0)
      .map((v: any) => v.size);

    this.selectedSize = ''; // Reset size when color changes
  }

  onSizeChange(): void {
    // Get the max quantity for the selected color and size
    const variation = this.product.productVariations.find(
      (v: any) => v.color === this.selectedColor && v.size === this.selectedSize
    );
    this.maxQuantity = variation ? variation.quantity : 0;
  }

  validateQuantity(): boolean {
    return this.quantity <= this.maxQuantity;
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  close() {
    this.activeModal.close();
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
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
    } else {
      this.cartServerService.addToCart(productToAdd);
    }

    this.activeModal.close('added');
  }
}