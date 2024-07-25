import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductsService } from '../../dashboard-service/products.service';
import { Prod } from '../../interface/product-all-details';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { SetVariationsComponent } from '../set-variations/set-variations.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product!: Prod;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductsService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProductDetails();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false; // Prevent page reloading when navigating to same route

  }

  loadProductDetails(): void {
    const productId = this.route.snapshot.params['id'];
    this.productService.getProductDetails(productId).subscribe(
      (data: Prod) => {
        this.product = data;
      },
      (error) => {
        this.router.navigate(['notfound']);
        // this.router.navigate(['user/profile']);
        // console.log(error);
      }
    );
  }

  onUpdate(productId: number) {
    const modalRef = this.modalService.open(SetVariationsComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.productId = productId;
    modalRef.componentInstance.variationAdded.subscribe(() => {
      this.loadProductDetails(); // Reload product details without reloading the page
    });
    modalRef.result.then(
      (result) => {
        if(result==="added")
        {
          this.toastService.add("Product Variations Added Successfully")
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(this.product.productId).subscribe(
        () => {
          alert('Product deleted successfully');

          if (this.router.url.includes(`/dashboard/products/${this.product.productId}`)) {
            this.router.navigate(['dashboard/products']);
          } else {
            this.router.navigate(['user/profile']);
          }
        },
        error => {
          alert('Failed to delete product');
        }
      );
    }
  }
}