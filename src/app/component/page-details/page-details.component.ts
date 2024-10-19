import { Component, Input } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { Router } from '@angular/router';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-page-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-details.component.html',
  styleUrl: './page-details.component.css',
})
export class PageDetailsComponent {
  productItem: any = null; // Initialize to avoid null issues
  counter: number = 0;
  @Input() id!: number;
  cartItems: { product: any }[] = [];
  showNotFound: boolean = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private modalService: NgbModal,
    private router: Router,
    public toastService: ToastService
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCart();
    this.productService.getProductById(this.id).subscribe(
      (res) => {
        if (res) {
          this.productItem = res;
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
}
