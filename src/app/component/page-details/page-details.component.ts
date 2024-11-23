import { Component, Input } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { Router } from '@angular/router';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { CartServerService } from '../../service/cart-server.service';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-details.component.html',
  styleUrl: './page-details.component.css',
})
export class PageDetailsComponent {
  productItem: any = null; // Initialize to avoid null issues
  counter: number = 0;
  @Input() id!: number;
  cartItems: { product: any }[] = [];
  showNotFound: boolean = false;
  maxQuantity: any;
  quantity: number = 1;
  submitted: boolean = false;
  selectedVariation: any;
  isHovering: boolean = false;
  lensPosition = '0% 0%'; // Positioning for background zoom

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private modalService: NgbModal,
    private router: Router,
    public toastService: ToastService,
    private cartServerService: CartServerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCart();
    this.productService.getProductById(this.id).subscribe(
      (res) => {
        if (res) {
          this.productItem = res;
          this.showNotFound = false;
          console.log(this.productItem);
        }
      },
      (error) => {
        if (error.status === 404) {
          this.showNotFound = true;
        } else if (error.status === 403) {
          this.router.navigate(['notfound']);
        }
      }
    );
  }

  // Group variations by size
  getGroupedVariationsBySize() {
    const grouped: { [size: string]: { color: string; quantity: number }[] } =
      {};

    this.productItem?.productVariations?.forEach((variation: any) => {
      const { color, size, quantity } = variation;
      if (!grouped[size]) {
        grouped[size] = [];
      }
      grouped[size].push({ color, quantity });
    });

    return grouped;
  }
  
  hasAvailableVariations(): boolean {
    const variations = this.getGroupedVariationsBySize();
    return (
      variations &&
      Object.keys(variations).some((key) =>
        variations[key].some((variation) => variation.quantity > 0) // Check if any variation has quantity > 0
      )
    );
  }

  addToCart(): void {
    if (this.productItem) {
      this.cartService.addToCart(this.productItem);
      this.toastService.add('Product added successfully to Cart');
    }
  }

  open(product: any) {
    const modalRef = this.modalService.open(AddToCartModalComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.product = product;
    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add('Product added successfully to Cart');
        }
      },
      () => {}
    );
  }


  validateQuantity2(): boolean {
    const variation = this.productItem.productVariations.find(
      (v: any) => v.color === "no_color" && v.size === "NO_SIZE"
    );
    this.maxQuantity = variation ? variation.quantity : 0;
    return this.quantity <= this.maxQuantity;
  }
  open2(product: any) {
    this.submitted = true;
    if (
      this.quantity <= 0 ||
      !this.validateQuantity2()
    ) {
      return; // Validation failed
    }

    const productToAdd = {
      productId: product.productId,
      title: product.productTitle,
      imageUrl: product.imageUrl,
      quantity: this.quantity,
      price: product.price,
      color: "no_color",
      size: "NO_SIZE"
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
      this.toastService.add('Product added successfully to Cart');
    } else {
      this.cartServerService.addToCart(productToAdd);
      this.toastService.add('Product added successfully to Cart');
    }

  }
  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  selectVariation(variation: any) {
    this.selectedVariation = variation; // Save the selected variation
  }

  hoverImage(imageUrl: string) {
    this.selectedVariation = { img: imageUrl }; // Update the selected variation
}
  generateRecommendations() {
    if (!this.productItem) return [];

    // Generate 10 recommendations based on the product item
    const recommendations = Array(10).fill(this.productItem);
    return recommendations;
  }

  mouseMove(event: MouseEvent) {
    const lens = document.querySelector('.lens') as HTMLElement;
    if (lens) {
      const { clientX, clientY } = event;
      // Center the lens on cursor
      lens.style.left = `${clientX - lens.offsetWidth / 2}px`; 
      lens.style.top = `${clientY - lens.offsetHeight / 2}px`;

      // Set the background position based on the lens position
      const lensX = (clientX / lens.offsetWidth) * 100;
      const lensY = (clientY / lens.offsetHeight) * 100;
      this.lensPosition = `${lensX}% ${lensY}%`;
    }
  }

  toggleLens(state: boolean) {
    this.isHovering = state;
  }
}
