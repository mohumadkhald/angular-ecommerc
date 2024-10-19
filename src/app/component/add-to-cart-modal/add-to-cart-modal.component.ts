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

  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;
  submitted: boolean = false;

  colors: string[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthService,
    private cartServerService: CartServerService,
  ) {}

  colorsAndSizes: { [color: string]: string[] } = {}; // or appropriate type
  availableColors: string[] = []; // to hold the keys of the object
  sizes: string[] = []; // sizes available for the selected color

  ngOnInit(): void {
    this.cdr.detectChanges();
    console.log(this.product);

    // Assuming colorsAndSizes is populated from the product object
    this.colorsAndSizes = this.product.colorsAndSizes;

    // Convert the keys of colorsAndSizes to an array
    this.availableColors = Object.keys(this.colorsAndSizes);
  }

  onColorChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    const color = selectElement.value;
    
    this.sizes = this.colorsAndSizes[color] || [];
    this.selectedSize = ''; // Reset size when a new color is selected
  }
  populateColors(): void {
    this.colors = Object.keys(this.product.productVariations || {});
  }


  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  close() {
    this.activeModal.close();
  }

  addToCart() {
    this.submitted = true;

    if (!this.selectedSize || !this.selectedColor || this.quantity <= 0) {
      return; // Validation fails, so we exit the method.
    }

    const productToAdd = {
      productId: this.product.productId,
      title: this.product.productTitle,
      imageUrl: this.product.imageUrl,
      size: this.selectedSize,
      color: this.selectedColor,
      quantity: this.quantity,
      price: this.product.price
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
    } else {
      this.cartServerService.addToCart(productToAdd);
    }

    this.activeModal.close('added');
  }
}

