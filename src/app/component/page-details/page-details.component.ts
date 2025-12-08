import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { CartServerService } from '../../service/cart-server.service';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interface/product';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-page-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  recommendedProducts$!: Observable<Product[]>;

  startIndex: number = 0;
  itemsPerPage: number = 6;
  maxReached: boolean = false;

  scrollLeft() {
    this.startIndex = Math.max(0, this.startIndex - this.itemsPerPage);
    this.updateMaxReached();
  }

  scrollRight() {
    this.startIndex += 1;
    this.updateMaxReached();
  }

  updateMaxReached() {
    this.recommendedProducts$.subscribe((items) => {
      this.maxReached = this.startIndex + this.itemsPerPage >= items.length + 1;
    });
  }

  goToAllProducts() {
    this.router.navigate(['/categories', this.productItem.subCategory.categoryName, this.productItem.subCategory.name]); // Change to your desired route
  }

  constructor(
    private route: ActivatedRoute,
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

    this.route.params.subscribe((params) => {
      const id = +params['id']; // Convert to number if needed
      this.id = id;

      this.productService.getProductById(id).subscribe(
        (res) => {
          if (res) {
            this.productItem = res;
            this.showNotFound = false;
            this.recommendedProducts$ =
              this.productService.getRecommendationsProducts(
                this.productItem.subCategory.id
              );

            const savedIndex = sessionStorage.getItem(
              `mainImageIndex-${this.id}`
            );
            if (savedIndex !== null) {
              this.mainImageIndex = parseInt(savedIndex, 10);
              this.selectedVariation = {
                img: this.productItem.imageUrls[this.mainImageIndex],
              };
            } else {
              this.mainImageIndex = 0;
              this.selectedVariation = { img: this.productItem.imageUrls[0] };
            }
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
    });
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
      Object.keys(variations).some(
        (key) => variations[key].some((variation) => variation.quantity > 0) // Check if any variation has quantity > 0
      )
    );
  }

  addToCart(): void {
    if (this.productItem) {
      this.cartService.addToCart(this.productItem);
      this.toastService.add('Product added successfully to Cart', 'success');
    }
  }

  open(product: any) {
    const modalRef = this.modalService.open(AddToCartModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false, // Prevent closing with the Esc key
    });
    modalRef.componentInstance.product = product;
    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add(
            'Product added successfully to Cart',
            'success'
          );
        }
      },
      () => {}
    );
  }

  validateQuantity2(): boolean {
    const variation = this.productItem.productVariations.find(
      (v: any) => v.color === 'no_color' && v.size === 'NO_SIZE'
    );
    this.maxQuantity = variation ? variation.quantity : 0;
    return this.quantity <= this.maxQuantity;
  }
  open2(product: any) {
    this.submitted = true;
    if (this.quantity <= 0 || !this.validateQuantity2()) {
      return; // Validation failed
    }

    const productToAdd = {
      productId: product.productId,
      title: product.productTitle,
      imageUrl: product.imageUrl,
      quantity: this.quantity,
      price: product.price,
      color: 'no_color',
      size: 'NO_SIZE',
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
      this.toastService.add('Product added successfully to Cart', 'success');
    } else {
      this.cartServerService.addToCart(productToAdd);
      this.toastService.add('Product added successfully to Cart', 'success');
    }
  }
  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  selectVariation(variation: any) {
    this.selectedVariation = variation; // Save the selected variation
  }
  mainImageIndex: number = 0;

  hoverImage(imageUrl: string, index: number) {
    this.selectedVariation = { img: imageUrl };
    this.mainImageIndex = index;
    sessionStorage.setItem(`mainImageIndex-${this.id}`, index.toString());
  }

  generateRecommendations() {
    if (!this.productItem) return [];
    return this.productService.getRecommendationsProducts(
      this.productItem.subCat.id
    );
  }

mouseMove(event: MouseEvent) {
  const lens = document.querySelector('.lens') as HTMLElement;
  const img = event.target as HTMLElement;

  const rect = img.getBoundingClientRect();

  // Cursor position inside the image
  const x = event.clientX - rect.left;
  const y = event.clientY*1.1 - rect.top;

  // Position the lens
  lens.style.left = `${event.clientX - lens.offsetWidth*3.2}px`;
  lens.style.top = `${event.clientY - lens.offsetHeight*1.1}px`;

  // background position (%) — correct formula
  const lensX = (x / rect.width) * 100;
  const lensY = (y / rect.height) * 100;

  this.lensPosition = `${lensX}% ${lensY}%`;
}

  toggleLens(state: boolean) {
    this.isHovering = state;
  }

  redirectToDetails(id: number) {
    this.router.navigate([`products/${id}`]);
  }
}
