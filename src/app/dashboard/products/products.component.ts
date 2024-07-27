import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProductComponent } from '../../component/add-product/add-product.component';
import { PaginationComponent } from '../../component/pagination/pagination.component';
import { ProductsService } from '../../dashboard-service/products.service';
import { Prod } from '../../interface/product-all-details';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { DashboardComponent } from '../dashboard.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SortOptionsComponent } from "../../component/sort-options/sort-options.component";
import { PaginatedResponse, Product } from '../../interface/product';
import { CustomRangeSliderComponent } from "../../component/custom-range-slider/custom-range-slider.component";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [PaginationComponent, CommonModule, SidebarComponent, SortOptionsComponent, CustomRangeSliderComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  products: any = [];
  searchQuery: string = '';
  sortBy = 'createdAt';
  sortDirection = 'desc';
  selectedSort: string = 'createdAtDesc';
  sortedProducts: Array<{ name: any; price: any }> = [];
  currentSortOption!: string;
  private hasQueryParams = false;
  numElement: number = 20;
  currentPage = 1;
  totalPages: number[] = [];
  selectedProductIds: number[] = [];
  filters = {
    inStock: true,
    notAvailable: false,
    priceRange: 250,
    minPrice: 0,
    maxPrice: 25000,
  };


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private authService: AuthService,
    private dashboardComponent: DashboardComponent
  ) {}

  ngOnInit(): void {
    // Handle queryParams changes
    this.route.queryParams.subscribe(
      (params) => {
        this.hasQueryParams = Object.keys(params).length > 0;

        this.filters.minPrice = +params['minPrice'] || this.filters.minPrice;
        this.filters.maxPrice = +params['maxPrice'] || this.filters.maxPrice;
        this.sortBy = params['sortBy'] || 'createdAt';
        this.sortDirection = params['sortDirection'] || 'desc';
        this.currentPage = +params['page'] || 1;

        // Construct currentSortOption from sortBy and sortDirection
        this.currentSortOption = `${this.sortBy}${this.sortDirection
          .charAt(0)
          .toUpperCase()}${this.sortDirection.slice(1)}`;

        // Load products based on query params
          this.loadProducts();
      
      },
      (error) => {}
    );

    // Initialize sortedProducts
    this.sortedProducts = [...this.products];
  }


  loadProducts(): void {
      this.productsService
        .getAllProducts(
          this.sortBy,
          this.sortDirection,
          this.filters.minPrice,
          this.filters.maxPrice,
          this.currentPage - 1, // Adjust page number for API
          this.numElement,
          this.searchQuery
        )
        .subscribe(
          (response: PaginatedResponse<Product[]>) => {
            this.products = response.content;
            this.currentPage = response.pageable.pageNumber + 1; // Update currentPage
            this.totalPages = Array.from(
              { length: response.totalPages },
              (_, i) => i + 1
            );
            console.log(response)
          },
          (error) => {}
        );

  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.loadProducts(); // Fetch products based on the search query
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    let sortBy = 'createdAt';
    let sortDirection = 'desc';

    switch (value) {
      case 'createdAtAsc':
        sortBy = 'createdAt';
        sortDirection = 'asc';
        break;
      case 'createdAtDesc':
        sortBy = 'createdAt';
        sortDirection = 'desc';
        break;
      case 'priceAsc':
        sortBy = 'price';
        sortDirection = 'asc';
        break;
      case 'priceDesc':
        sortBy = 'price';
        sortDirection = 'desc';
        break;
    }

    this.currentSortOption = value;
    this.updateQueryParams({ sortBy, sortDirection });
    this.loadProducts();
  }

  onPriceRangeChange(): void {
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
    });
    this.loadProducts();
  }

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.route.snapshot.queryParams, ...params },
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }

  deleteProduct(prodId: number): void {
    this.productsService.deleteProduct(prodId).subscribe(
      () => {
        this.products = this.products.filter(
          (product: { productId: number; }) => product.productId !== prodId
        );
        this.dashboardComponent.fetchProductCount();
      },
      (error) => {
        console.error('Error deleting product:', error);
      }
    );
  }
  deleteProducts(): void {
    if (this.selectedProductIds.length === 0) {
      console.warn('No products selected for deletion.');
      return;
    }

    this.productsService.deleteProducts(this.selectedProductIds).subscribe(
      () => {
        this.products = this.products.filter(
          (product: { productId: number; }) => !this.selectedProductIds.includes(product.productId)
        );
        this.selectedProductIds = []; // Clear the selection
        this.dashboardComponent.fetchProductCount();
        this.toastService.add('Products deleted successfully');
      },
      (error) => {
        console.error('Error deleting products:', error);
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
      this.loadProducts(); // Refresh the product list
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
        this.loadProducts(); // Refresh the product list
        this.selectedProductIds = []; // Clear the selection
        this.toastService.add('Discount applied successfully');
      },
      (error) => {
        console.error('Error applying discount:', error);
      }
    );
  }

  onPageChange(page: number): void {
    this.updateQueryParams({ page });
    this.loadProducts();
  }
  auth(): boolean {
    return this.authService.isLoggedIn();
  }
}
