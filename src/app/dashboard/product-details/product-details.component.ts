import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductsService } from '../../dashboard-service/products.service';
import { Prod } from '../../interface/product-all-details';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { SetVariationsComponent } from '../set-variations/set-variations.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, MatProgressSpinner],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product!: Prod;
  loading: boolean = true;
  productId!: number;
  mainImage!: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductsService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    // Load previously selected main image from sessionStorage
    const savedMain = sessionStorage.getItem(`mainImage-${this.productId}`);
    if (savedMain) {
      this.mainImage = savedMain;
    }
    this.loadProductDetails();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false; // Prevent page reloading when navigating to same route
  }
  onUpdate(productId: number) {
    const modalRef = this.modalService.open(SetVariationsComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.productId = productId;
    modalRef.componentInstance.color = this.product.productVariation[0].color;
    modalRef.componentInstance.size = this.product.productVariation[0].size;
    modalRef.componentInstance.lastQuantity = this.product.productVariation[0].quantity;
    modalRef.componentInstance.variationAdded.subscribe(() => {
      this.loadProductDetails(); // Reload product details without reloading the page
    });
    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add(
            'Product Variations Added Successfully',
            'success'
          );
        }
      },
      (reason) => {}
    );
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(this.product.productId).subscribe(
        () => {
          alert('Product deleted successfully');

          if (
            this.router.url.includes(
              `/dashboard/products/${this.product.productId}`
            )
          ) {
            this.router.navigate(['dashboard/products']);
          } else {
            this.router.navigate(['user/profile']);
          }
        },
        (error) => {
          alert('Failed to delete product');
        }
      );
    }
  }
  @ViewChild('fileInput')
  fileInput!: ElementRef;
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadImage(file);
    }
  }

  setMainImage(imgIndex: number) {
    this.mainImage = this.product.imageUrls[imgIndex];
    sessionStorage.setItem(
      `mainImageIndex-${this.productId}`,
      imgIndex.toString()
    );
    console.log('Selected index:', imgIndex);
  }

  loadProductDetails(): void {
    this.productService.getProductDetails(this.productId).subscribe(
      (data: Prod) => {
        this.product = data;
        this.loading = false;

        const savedIndexStr = sessionStorage.getItem(
          `mainImageIndex-${this.productId}`
        );
        const savedIndex = savedIndexStr ? parseInt(savedIndexStr, 10) : 0;

        if (savedIndex >= 0 && savedIndex < data.imageUrls.length) {
          this.mainImage = data.imageUrls[savedIndex];
        } else {
          this.mainImage = data.imageUrls[0]; // fallback to first image
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  // Optional helper for template
  getSavedMainImageIndex(): number {
    const savedIndexStr = sessionStorage.getItem(
      `mainImageIndex-${this.productId}`
    );
    return savedIndexStr ? parseInt(savedIndexStr, 10) : 0;
  }

  uploadImage(file: File) {
    this.productService
      .changePhoto(this.product.productTitle, file, this.mainImage)
      .subscribe(
        (response: any) => {
          if (response && response.newImageUrl) {
            const newImg = response.newImageUrl;

            // Add new image to product.imageUrls if not already there
            if (!this.product.imageUrls.includes(newImg)) {
              this.product.imageUrls.push(newImg);
            }

            // Immediately set new image as main and persist selection
            this.mainImage = newImg;
            sessionStorage.setItem(`mainImage-${this.productId}`, newImg);
          }

          this.toastService.add('Image updated successfully', 'success');

          // NO need to reload product details immediately
          this.loadProductDetails();
        },
        (error) => {
          this.toastService.add('Image upload failed', 'error');
        }
      );
  }
}
