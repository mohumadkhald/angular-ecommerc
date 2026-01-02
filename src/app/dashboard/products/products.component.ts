import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProductComponent } from '../../component/add-product/add-product.component';
import { PaginationComponent } from '../../component/pagination/pagination.component';
import { ProductsService } from '../../dashboard-service/products.service';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { DashboardComponent } from '../dashboard.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SortOptionsComponent } from '../../component/sort-options/sort-options.component';
import { PaginatedResponse, Product } from '../../interface/product';
import { CustomRangeSliderComponent } from '../../component/custom-range-slider/custom-range-slider.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ModelFilterComponent } from '../../component/model-filter/model-filter.component';
import { ProductService } from '../../service/product.service';
import { Title } from '@angular/platform-browser';
import { CategoryService } from '../../service/category.service';
import { MatDialog } from '@angular/material/dialog';
import { EditProductComponent } from '../../component/edit-product /edit-product.component';
import { forkJoin, map, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    PaginationComponent,
    CommonModule,
    SidebarComponent,
    SortOptionsComponent,
    CustomRangeSliderComponent,
    MatProgressSpinner,
    FormsModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  currentSubCategoryImage: any;
  openSubLists: { [key: string]: boolean } = {};
  @ViewChild('slider') slider!: ElementRef;
  colorOptions: string[] = ['white', 'black', 'red', 'yellow', 'blue', 'green'];

  filters = {
    inStock: false,
    notAvailable: false,
    priceRange: 250,
    minPrice: 0,
    maxPrice: 25000,
    colors: [] as string[],
    sizes: [] as string[],
  };

  categories: any[] = [];
  subCategories: any[] = [];
  categoryTitle: string = 'All';
  currentCategoryName: string = 'All';
  currentCategoryImage: any;
  inStockCount: number = 0;
  outOfStockCount: number = 0;
  screenWidth: any;

  loading: boolean = true;
  products: any = [];
  nameQuery: string = '';
  sortBy = 'createdAt';
  sortDirection = 'desc';
  currentSortOption!: string;
  selectedSort: string = 'createdAtDesc';

  sortedProducts: Array<{ name: any; price: any }> = [];
  private hasQueryParams = false;
  currentPage = 1;
  totalPages: number[] = [];
  selectedProductIds: number[] = [];
  countProducts: number = 0;
  discount!: number;
  currentEmailSeller: string = '';
  emailSellers: string[] = [];
  currentSubCat: string = '';
  currentElementSizeOption!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private authService: AuthService,
    private dashboardComponent: DashboardComponent,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
      this.currentElementSizeOption = params['pageSize'] || '20';
      this.sortBy = params['sortBy'] || 'createdAt';
      this.sortDirection = params['sortDirection'] || 'desc';

      this.filters.minPrice = +params['minPrice'] || 0;
      this.filters.maxPrice = +params['maxPrice'] || 25000;
      this.filters.colors = params['colors']?.split(',') || [];
      this.filters.sizes = params['sizes']?.split(',') || [];
      this.filters.inStock = params['inStock'] === 'true';
      this.filters.notAvailable = params['notAvailable'] === 'true';

      this.currentSortOption = `${this.sortBy}${this.sortDirection
        .charAt(0)
        .toUpperCase()}${this.sortDirection.slice(1)}`;

      // ✅ ONLY HERE loading happens
      this.reloadProducts();
    });
  }

  /* ================================================= */
  /* ================= API LOGIC ===================== */
  /* ================================================= */

  private loadProducts$(): Observable<void> {
    let available: boolean | null = null;

    if (this.filters.inStock && !this.filters.notAvailable) available = true;
    else if (!this.filters.inStock && this.filters.notAvailable)
      available = false;

    return this.productsService
      .getAllProducts(
        this.sortBy,
        this.sortDirection,
        this.filters.minPrice,
        this.filters.maxPrice,
        this.filters.colors,
        this.filters.sizes,
        this.currentPage - 1,
        this.currentElementSizeOption,
        this.currentEmailSeller,
        this.currentSubCat,
        this.nameQuery,
        available
      )
      .pipe(
        tap((res: PaginatedResponse<Product[]>) => {
          this.products = res.content;
          this.currentPage = res.pageable.pageNumber + 1;
          this.totalPages = Array.from(
            { length: res.totalPages },
            (_, i) => i + 1
          );
          this.countProducts = res.totalElements;
        }),
        map(() => void 0)
      );
  }

  reloadProducts(): void {
    this.loading = true;

    this.loadProducts$().subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false),
    });
  }

  /* ================================================= */
  /* =================== ACTIONS ===================== */
  /* ================================================= */
  onSearch(): void {
    this.updateQueryParams({ page: 1 });
  }

  onSortChange(value: string): void {
    // Change parameter type to string directly
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

    this.currentSortOption = value; // Update the current sort option
    this.updateQueryParams({ sortBy, sortDirection }); // Update the query parameters
  }
  onPageChange(page: number): void {
    this.updateQueryParams({ page });
  }

  onSizeElementChange(event: String): void {
    this.updateQueryParams({ pageSize: event, page: 1 });
  }

  onEmailChange(email: string): void {
    this.currentEmailSeller = email;
    this.updateQueryParams({ page: 1 });
  }

  onSubCatChange(subCat: string): void {
    this.currentSubCat = subCat;
    this.updateQueryParams({ page: 1 });
  }

  /* ================================================= */
  /* ===================== MODALS ==================== */
  /* ================================================= */

  open(): void {
    this.loading = false; // default

    const modalRef = this.modalService.open(AddProductComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    let added = false; // ⭐ track real add

    // ✅ Fired ONLY when product is successfully added
    modalRef.componentInstance.productAdded.subscribe(() => {
      added = true;
      this.loading = true; // 🔥 start loading AFTER modal closes
    });

    modalRef.result.then(
      (result) => {
        // ✅ Modal closed AFTER add
        if (result === 'added' && added) {
          forkJoin([
            this.reloadProducts(),
            // this.dashboardComponent.fetchProductCount$(),
          ]).subscribe({
            next: () => {
              // ⏱ delay toast after UI updates
              this.toastService.add('Product added successfully', 'success');
              this.loading = false;
            },
            error: () => (this.loading = false),
          });
        } else {
          // ❌ closed without add
          this.loading = false;
        }
      },
      () => {
        // ❌ dismissed (ESC / backdrop)
        this.loading = false;
      }
    );
  }

  edit(product: Product): void {
    const modalRef = this.modalService.open(EditProductComponent, {
      size: 'lg',
      centered: true,
    });

    modalRef.componentInstance.product = product;

    modalRef.componentInstance.productAdded.subscribe(() => {
      this.reloadProducts();
      // this.dashboardComponent.fetchProductCount$().subscribe();
    });
  }

  /* ================================================= */
  /* =================== HELPERS ===================== */
  /* ================================================= */

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  // loadProducts(): void {
  //   let available: boolean | null = null;
  //   if (this.filters.inStock && !this.filters.notAvailable) {
  //     available = true;
  //   } else if (!this.filters.inStock && this.filters.notAvailable) {
  //     available = false;
  //   }

  //   this.productsService
  //     .getAllProducts(
  //       this.sortBy,
  //       this.sortDirection,
  //       this.filters.minPrice,
  //       this.filters.maxPrice,
  //       this.filters.colors,
  //       this.filters.sizes,
  //       this.currentPage - 1, // Adjust page number for API
  //       this.currentElementSizeOption,
  //       this.currentEmailSeller,
  //       this.currentSubCat,
  //       this.nameQuery,
  //       available
  //     )
  //     .subscribe(
  //       (response: PaginatedResponse<Product[]>) => {
  //         this.loading = false;
  //         this.products = response.content;
  //         this.currentPage = response.pageable.pageNumber + 1; // Update currentPage
  //         this.totalPages = Array.from(
  //           { length: response.totalPages },
  //           (_, i) => i + 1
  //         );
  //         this.countProducts = response.totalElements;
  //         // this.updatePageTitle(); this is solve issue
  //       },
  //       (error) => {
  //         this.loading = false;
  //       }
  //     );
  // }

  deleteProduct(prodId: number): void {
    if (confirm('Are you sure you want to delete this Product?')) {
      this.productsService.deleteProduct(prodId).subscribe(
        () => {
          this.products = this.products.filter(
            (product: { productId: number }) => product.productId !== prodId
          );
          // this.dashboardComponent.fetchProductCount$().subscribe();
        },
        (error) => {}
      );
    }
  }
  deleteProducts(): void {
    if (this.selectedProductIds.length === 0) {
      this.toastService.add('Not Selected any Products', 'warning');
    } else {
      if (confirm('Are you sure you want to delete this products?')) {
        this.loading = true;
        this.productsService.deleteProducts(this.selectedProductIds).subscribe(
          () => {
            this.products = this.products.filter(
              (product: { productId: number }) =>
                !this.selectedProductIds.includes(product.productId)
            );
            this.selectedProductIds = []; // Clear the selection
            // this.dashboardComponent.fetchProductCount$().subscribe();
            this.loading = false;
            this.toastService.add('Products deleted successfully', 'success');
          },
          (error) => {}
        );
      }
    }
  }

  detailsProduct(prodId: number): void {
    this.router.navigate([`dashboard/products/${prodId}`]);
  }

  onDiscountChange(newValue: number): void {
    this.discount = newValue;
  }

  makeDiscount(): void {
    const discountValue = this.discount;
    if (isNaN(discountValue) || discountValue == null) {
      this.toastService.add('Invalid discount value.', 'warning');
      return;
    }
    if (discountValue < 0 || discountValue > 100) {
      this.toastService.add(
        'Invalid discount value. It should be between 0 and 100.',
        'warning'
      );
      return;
    }
    if (this.selectedProductIds.length === 0) {
      this.toastService.add('Not Selected any Products', 'warning');
      return;
    }
    this.productsService
      .setDiscount(this.selectedProductIds, discountValue)
      .subscribe(
        () => {
          this.reloadProducts(); // Refresh the product list
          this.toastService.add('Discount applied successfully', 'success');
        },
        (error) => {
          this.toastService.add(error.message, 'error');
        }
      );
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }
  // To track the selection state of each product
  selectedProducts: { [key: number]: boolean } = {};

  // Toggle all selections
  makeAllSelected(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.products.forEach((product: { productId: number }) => {
      this.selectedProducts[product.productId] = isChecked;
    });
    if (isChecked) {
      // Select all product IDs
      this.selectedProductIds = this.products.map(
        (product: { productId: number }) => product.productId
      );
    } else {
      // Deselect all
      this.selectedProductIds = [];
    }
  }

  // Toggle individual selection
  toggleProductSelection(productId: number): void {
    if (this.selectedProductIds.includes(productId)) {
      // Remove productId if already selected
      this.selectedProductIds = this.selectedProductIds.filter(
        (id) => id !== productId
      );
    } else {
      // Add productId to the selected list
      this.selectedProductIds.push(productId);
    }
  }

  openFilterModal() {
    const dialogRef = this.dialog.open(ModelFilterComponent, {
      width: '400px',
      data: {
        categoryTitle: this.categoryTitle,
        filters: this.filters,
        colorOptions: this.colorOptions,
        inStockCount: this.inStockCount,
        outOfStockCount: this.outOfStockCount,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.filters = { ...this.filters, ...result.filters };
        this.reloadProducts(); // Re-load products with updated filters
      }
    });
  }
}
