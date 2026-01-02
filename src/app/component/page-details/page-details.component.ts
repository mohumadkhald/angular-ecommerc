import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CartService } from '../../service/cart.service';
import { CommonModule, NgClass } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { CartServerService } from '../../service/cart-server.service';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interface/product';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-page-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StarRatingComponent],
  templateUrl: './page-details.component.html',
  styleUrl: './page-details.component.css',
})
export class PageDetailsComponent implements OnInit, OnDestroy {
  @Input() id!: number;

  productItem: any = null;
  recommendedProducts$!: Observable<any[]>;

  quantity = 1;
  maxQuantity = 0;
  submitted = false;

  selectedImage!: string;
  mainImageIndex = 0;

  startIndex = 0;
  itemsPerPage = 6;
  maxReached = false;
  selectedColor = '';
  selectedSize = '';

  showNotFound = false;

  @ViewChild('lens') lensRef!: ElementRef;
  @ViewChild('mainImage') imageRef!: ElementRef;

  isHovering = false;
  isMobile = false;
  lensPosition = '0% 0%';
  zoomLevel = 2.5; // 250%

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private modalService: NgbModal,
    private router: Router,
    private toastService: ToastService,
    private cartServerService: CartServerService,
    private authService: AuthService
  ) {}

  /* -------------------- INIT -------------------- */

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id }) => this.loadProduct(+id));
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* -------------------- PRODUCT -------------------- */

  private loadProduct(id: number): void {
    this.id = id;

    this.productService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.productItem = product;
          this.showNotFound = false;

          this.initMainImage();
          this.loadRecommendations();
        },
        error: (err) => {
          if (err.status === 404) this.showNotFound = true;
          else this.router.navigate(['/notfound']);
        },
      });
  }

  private initMainImage(): void {
    const savedIndex = sessionStorage.getItem(`mainImageIndex-${this.id}`);
    this.mainImageIndex = savedIndex ? +savedIndex : 0;
    this.selectedImage = this.productItem.imageUrls[this.mainImageIndex];
  }

  /* -------------------- RECOMMENDATIONS -------------------- */

  private loadRecommendations(): void {
    this.recommendedProducts$ = this.productService
      .getRecommendationsProducts(this.productItem.subCategory.id)
      .pipe(
        tap((items) => {
          this.maxReached = this.startIndex + this.itemsPerPage >= items.length;
        })
      );
  }

  scrollLeft(): void {
    this.startIndex = Math.max(0, this.startIndex - this.itemsPerPage);
  }

  scrollRight(): void {
    this.startIndex += this.itemsPerPage;
  }

  goToAllProducts(): void {
    this.router.navigate([
      '/categories',
      this.productItem.subCategory.categoryName,
      this.productItem.subCategory.name,
    ]);
  }

  /* -------------------- CART -------------------- */

  open(product: any): void {
    const modalRef = this.modalService.open(AddToCartModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.product = product;

    modalRef.result
      .then((res) => {
        if (res === 'added') {
          this.toastService.add(`Product ${product.productTitle} added to cart`, 'success');
        }
      })
      .catch(() => {});
  }

  openSimple(product: any): void {
    this.submitted = true;
    if (!this.validateQuantity()) return;

    const payload = {
      productId: product.productId,
      title: product.productTitle,
      imageUrl: product.imageUrls[0],
      quantity: this.quantity,
      price: product.price,
      color: this.selectedColor || 'no_color',
      size: this.selectedSize || 'NO_SIZE',
      discount: product.discountPercent,
      discountedPrice: product.discountPrice,
    };

    this.authService.isLoggedIn()
      ? this.cartServerService.addToCart(payload)
      : this.cartService.addToCart(payload);

    this.toastService.add(`Product ${product.productTitle} added to cart`, 'success');
  }

  // validateQuantity(): boolean {
  //   const variation = this.productItem.productVariations.find(
  //     (v: any) => v.color === 'no_color'
  //   );
  //   this.maxQuantity = variation?.quantity || 0;
  //   return this.quantity > 0 && this.quantity <= this.maxQuantity;
  // }

  validateQuantity(): boolean {
    if (this.productItem.productVariations[0]?.color === 'no_color') {
      const variation = this.productItem.productVariations.find(
        (v: any) => v.color === 'no_color'
      );
      this.maxQuantity = variation?.quantity || 0;
    } else {
      const variation = this.productItem.productVariations.find(
        (v: any) =>
          v.color === this.selectedColor && v.size === this.selectedSize
      );
      this.maxQuantity = variation?.quantity || 0;
    }
    return this.quantity > 0 && this.quantity <= this.maxQuantity;
  }

  /* -------------------- IMAGES -------------------- */

  hoverImage(image: string, index: number): void {
    this.selectedImage = image;
    this.mainImageIndex = index;
    sessionStorage.setItem(`mainImageIndex-${this.id}`, index.toString());
  }

  mouseMove(event: MouseEvent): void {
    if (!this.lensRef) return;

    const lens = this.lensRef.nativeElement;
    const img = event.target as HTMLElement;
    const rect = img.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    lens.style.left = `${x - lens.offsetWidth / 2}px`;
    lens.style.top = `${y - lens.offsetHeight / 2}px`;

    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    this.lensPosition = `${bgX}% ${bgY}%`;
  }

  /* -------------------- NAV -------------------- */

  redirectToDetails(id: number): void {
    this.router.navigate(['/products', id]);
  }

  toggleLens(state: boolean) {
    if (!this.isMobile) {
      this.isHovering = state;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.lensRef || !this.imageRef) return;

    const lens = this.lensRef.nativeElement;
    const img = this.imageRef.nativeElement;
    const rect = img.getBoundingClientRect();

    const lensRadius = lens.offsetWidth / 2;

    // 🔴 RAW cursor (for background)
    let rawX = event.clientX - rect.left;
    let rawY = event.clientY - rect.top;

    // 🟢 CLAMPED cursor (for lens movement)
    let x = Math.max(lensRadius, Math.min(rawX, rect.width - lensRadius));
    let y = Math.max(lensRadius, Math.min(rawY, rect.height - lensRadius));

    // Move lens
    lens.style.left = `${x - lensRadius}px`;
    lens.style.top = `${y - lensRadius}px`;

    // 🔥 Background uses RAW values
    const bgX = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
    const bgY = Math.max(0, Math.min(100, (rawY / rect.height) * 100));

    this.lensPosition = `${bgX}% ${bgY}%`;
  }

  mobileZoom = false;

  toggleMobileZoom() {
    if (this.isMobile) {
      this.mobileZoom = !this.mobileZoom;
    }
  }
  getSize(size: string, color: string) {
    this.selectedSize = size;
    this.selectedColor = color;
    console.log(this.selectedSize, this.selectedColor);
  }
}
