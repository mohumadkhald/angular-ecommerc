import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginatedResponse, Product } from '../../interface/product';
import { ProductService } from '../../service/product.service';
import { CustomRangeSliderComponent } from '../custom-range-slider/custom-range-slider.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SortOptionsComponent } from '../sort-options/sort-options.component';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
import { ModelFilterComponent } from '../model-filter/model-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-result-search',
  standalone: true,
  templateUrl: './result-search.component.html',
  styleUrl: './result-search.component.css',
  imports: [
    CommonModule,
    ProductCardComponent,
    FormsModule,
    PaginationComponent,
    SortOptionsComponent,
    CustomRangeSliderComponent,
    SortOptionsComponent,
  ],
})
export class ResultSearchComponent implements OnInit {
  products: any[] = [];
  currentPage = 1;
  totalPages: number[] = [];
  colorOptions: string[] = ['red', 'yellow', 'blue', 'green'];
  filters = {
    inStock: true,
    notAvailable: false,
    priceRange: 250,
    minPrice: 0,
    maxPrice: 25000,
    colors: [] as string[],
    sizes: [] as string[],
  };
  subCategoryName!: string;
  categoryTitle!: string;
  productName!: string;
  sortBy = 'createdAt';
  sortDirection = 'desc';
  currentSortOption!: string;
  currentElementSizeOption: string = '';
  loading: boolean = true;
  currentCategoryName: string = '';
  currentCategoryImage: any;
  sortedProducts: Array<{ name: any; price: any }> = [];
  selectedSort: string = 'createdAtDesc';
  private hasQueryParams = false;
  inStockCount: number = 0;
  outOfStockCount: number = 0;
  screenWidth: any;
  currentEmailSeller: string = '';
  display: boolean = false;
  currentCategoryId: any;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Handle paramMap changes
    // this.route.paramMap.subscribe(
    //   (paramMap) => {
    //     this.hasQueryParams = false;

    //     // Load products if no query params present
    //     if (!this.hasQueryParams) {
    //       setTimeout(() => {
    //         this.loadProducts();
    //       }, 200);
    //     }
    //   },
    //   (error) => {}
    // );

    // Handle queryParams changes
    this.route.queryParams.subscribe(
      (params) => {
        this.hasQueryParams = Object.keys(params).length > 0;
        this.categoryTitle = params['category'];
        this.productName = params['search'];
        this.currentPage = params['page'] ? +params['page'] : 1;

        this.filters.minPrice = +params['minPrice'] || this.filters.minPrice;
        this.filters.maxPrice = +params['maxPrice'] || this.filters.maxPrice;
        this.filters.colors = params['colors']
          ? params['colors'].split(',')
          : [];
        this.filters.sizes = params['sizes'] ? params['sizes'].split(',') : [];
        this.sortBy = params['sortBy'] || 'createdAt';
        this.sortDirection = params['sortDirection'] || 'desc';
        this.currentPage = +params['page'] || 1;
        this.currentElementSizeOption = params['pageSize'] || 20;

        // Initialize inStock and notAvailable filters
        this.filters.inStock = params['inStock'] === 'true';
        this.filters.notAvailable = params['notAvailable'] === 'true';

        // Construct currentSortOption from sortBy and sortDirection
        this.currentSortOption = `${this.sortBy}${this.sortDirection
          .charAt(0)
          .toUpperCase()}${this.sortDirection.slice(1)}`;

        // Load products based on query params
        if (this.hasQueryParams) {
          this.loadProducts();
        }
      },
      (error) => {}
    );

    // Initialize sortedProducts
    this.sortedProducts = [...this.products];
    if (this.categoryTitle) {
      this.onFilterChange();
    }
  }

  showNotFound: boolean = false;

  loadProducts(): void {
    if (this.categoryTitle) {
      let available: boolean | null;

      if (this.filters.inStock && !this.filters.notAvailable) {
        available = true; // Only in stock
      } else if (!this.filters.inStock && this.filters.notAvailable) {
        available = false; // Only out of stock
      } else {
        available = null; // Both selected or both false → all
      }

      this.productService
        .getProductsByCategoryAndProductName(
          this.categoryTitle,
          this.productName,
          this.sortBy,
          this.sortDirection,
          this.filters.minPrice,
          this.filters.maxPrice,
          this.currentPage - 1, // Adjust page number for API
          this.currentElementSizeOption,
          this.filters.colors,
          this.filters.sizes,
          available
        )
        .subscribe(
          (response: PaginatedResponse<Product[]>) => {
            this.loading = false;
            this.products = response.content;
            if (response.content && response.content.length > 0) {
              // Check if products have no color
              for (let i = 0; i < response.content.length; i++) {
                if (
                  response.content[i].colorsAndSizes['no_color'] &&
                  response.content.length > 1
                ) {
                  this.display = false;
                } else {
                  this.display = true;
                }
                // send catID to sort component to get sellers in this category
                this.currentCategoryId = response.content[0].subCategory.id;
              }
            }
            this.currentPage = response.pageable.pageNumber + 1; // Update currentPage
            this.totalPages = Array.from(
              { length: response.totalPages },
              (_, i) => i + 1
            );

            // Update stock counts
            const stockCounts = ProductCardComponent.getStockCounts(
              this.products
            );
            this.inStockCount = stockCounts.inStockCount;
            this.outOfStockCount = stockCounts.outOfStockCount;
          },
          (error) => {
            if (error.status === 404) {
              this.loading = false;
              this.showNotFound = true;
            }
          }
        );
    } else {
      this.loading = false;
      this.products = [];
      // Reset counts if no products are loaded
      this.inStockCount = 0;
      this.outOfStockCount = 0;
    }
  }

  open(product: any) {
    const modalRef = this.modalService.open(AddToCartModalComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.product = product;
  }

  redirectToDetails(id: number) {
    this.router.navigate([`product/details/${id}`]);
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
    const page = 1;
    this.updateQueryParams({ sortBy, sortDirection, page }); // Update the query parameters
    this.loadProducts(); // Reload products based on the new sort option
  }

  onSizeElementChange(value: string) {
    const pageSize = value;
    const page = 1;
    this.updateQueryParams({ pageSize, page }); // Update the query parameters
    this.loadProducts(); // Reload products based on the new sort option
  }

  onFilterChange(type?: 'inStock' | 'notAvailable'): void {
    if (type === 'inStock' && this.filters.inStock) {
      this.filters.notAvailable = false;
    } else if (type === 'notAvailable' && this.filters.notAvailable) {
      this.filters.inStock = false;
    }

    const page = 1;
    this.updateQueryParams({
      inStock: this.filters.inStock ? 'true' : 'false',
      notAvailable: this.filters.notAvailable ? 'true' : 'false',
      page,
    });

    this.loadProducts();
  }

  onPriceRangeChange(): void {
    const page = 1;
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
      page,
    });
    this.loadProducts();
  }

  onColorChange(color: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filters.colors.push(color);
    } else {
      const index = this.filters.colors.indexOf(color);
      if (index > -1) {
        this.filters.colors.splice(index, 1);
      }
    }
    const page = 1;
    this.updateQueryParams({ colors: this.filters.colors.join(','), page });
    this.loadProducts();
  }

  onSizeChange(size: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filters.sizes.push(size);
    } else {
      const index = this.filters.sizes.indexOf(size);
      if (index > -1) {
        this.filters.sizes.splice(index, 1);
      }
    }
    const page = 1;
    this.updateQueryParams({ sizes: this.filters.sizes.join(','), page });
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.updateQueryParams({ page });
    this.loadProducts();
  }
  scrollLeft(slider: HTMLElement) {
    const scrollAmount = slider.offsetWidth - slider.offsetWidth * 0.01;
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  scrollRight(slider: HTMLElement) {
    const scrollAmount = slider.offsetWidth - slider.offsetWidth * 0.01;
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.handleScreenResize(event.target.innerWidth);
  }

  private handleScreenResize(width: number): void {
    if (width >= 767) {
      // this.dialogRef.close();
    }
  }

  openFilterModal() {
    const dialogRef = this.dialog.open(ModelFilterComponent, {
      width: '400px',
      data: {
        categoryTitle: this.categoryTitle,
        filters: this.filters,
        subCategoryName: this.subCategoryName,
        colorOptions: this.colorOptions,
        inStockCount: this.inStockCount,
        outOfStockCount: this.outOfStockCount,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.filters = { ...this.filters, ...result.filters };
        this.loadProducts(); // Re-load products with updated filters
      }
    });
  }

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.route.snapshot.queryParams, ...params },
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }


}
