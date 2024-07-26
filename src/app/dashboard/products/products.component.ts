import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProductComponent } from '../../component/add-product/add-product.component';
import { PaginationComponent } from '../../component/pagination/pagination.component';
import { ProductsService } from '../../dashboard-service/products.service';
import { Prod } from '../../interface/product-all-details';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { DashboardComponent } from '../dashboard.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [PaginationComponent, CommonModule, SidebarComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  products: Prod[] = [];
  currentPage = 1;
  totalPages: number[] = [];
  selectedProductIds: number[] = [];

  constructor(
    private router: Router,
    private productsService: ProductsService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private authService: AuthService,
    private dashboardComponent: DashboardComponent
  ) {}

  ngOnInit(): void {
    this.fetchProducts(this.currentPage - 1);
  }

  fetchProducts(page: number = 0, pageSize: number = 10): void {
    this.productsService.getAllProducts(page, pageSize).subscribe(
      (data) => {
        this.products = data.content;
        this.currentPage = data.pageable.pageNumber + 1;
        this.totalPages = Array.from(
          { length: data.totalPages },
          (_, i) => i + 1
        );
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }

  deleteProduct(prodId: number): void {
    this.productsService.deleteProduct(prodId).subscribe(
      () => {
        this.products = this.products.filter(
          (product) => product.productId !== prodId
        );
        this.dashboardComponent.fetchProductCount();
      },
      (error) => {
        console.error('Error deleting product:', error);
      }
    );
  }

  detailsProduct(prodId: number): void {
    this.router.navigate([`dashboard/products/${prodId}`]);
  }

  open() {
    const modalRef = this.modalService.open(AddProductComponent, {
      size: 'lg',
      centered: true,
    });

    modalRef.componentInstance.productAdded.subscribe(() => {
      this.fetchProducts(this.currentPage - 1); // Refresh the product list
      this.dashboardComponent.fetchProductCount();
    });

    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add('Product added successfully');
        }
      },
      (reason) => {}
    );
  }

  toggleProductSelection(productId: number): void {
    if (this.selectedProductIds.includes(productId)) {
      this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
    } else {
      this.selectedProductIds.push(productId);
    }
  }

  makeDiscount(discount: string): void {
    const discountValue = Number(discount);
    if (isNaN(discountValue)) {
      console.warn('Invalid discount value.');
      return;
    }

    if (this.selectedProductIds.length === 0) {
      console.warn('No products selected for discount.');
      return;
    }

    this.productsService.setDiscount(this.selectedProductIds, discountValue).subscribe(
      () => {
        this.fetchProducts(this.currentPage - 1); // Refresh the product list
        this.selectedProductIds = []; // Clear the selection
        this.toastService.add('Discount applied successfully');
      },
      (error) => {
        console.error('Error applying discount:', error);
      }
    );
  }

  onPageChange(page: number): void {
    this.fetchProducts(page - 1);
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }
}
