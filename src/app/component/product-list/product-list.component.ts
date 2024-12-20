import {
  CommonModule,
  CurrencyPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgStyle,
} from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';

import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginatedResponse, Product } from '../../interface/product';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { CategoryService } from '../../service/category.service';
import { ProductService } from '../../service/product.service';
import { ToastService } from '../../service/toast.service';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
import { CustomRangeSliderComponent } from '../custom-range-slider/custom-range-slider.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ExpiredSessionDialogComponent } from '../expired-session-dialog/expired-session-dialog.component';
import { ModelFilterComponent } from '../model-filter/model-filter.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SortOptionsComponent } from '../sort-options/sort-options.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  imports: [
    ProductCardComponent,
    FormsModule,
    CommonModule,
    CurrencyPipe,
    RouterLink,
    RouterLinkActive,
    MatProgressSpinner,
    CapitalizePipe,
    CustomRangeSliderComponent,
    PaginationComponent,
    SortOptionsComponent,
    ModelFilterComponent,
  ],
})
export class ProductListComponent implements OnInit {
  currentSubCategoryImage: any;
  openSubLists: { [key: string]: boolean } = {};
  @ViewChild('slider') slider!: ElementRef;
  colorOptions: string[] = ['white', 'black', 'red', 'yellow', 'blue', 'green'];

  filters = {
    inStock: true,
    notAvailable: true,
    priceRange: 250,
    minPrice: 0,
    maxPrice: 25000,
    colors: [] as string[],
    sizes: [] as string[],
  };

  categories: any[] = [];
  subCategories: any[] = [];
  products: any[] = [];
  categoryTitle: string | null | undefined;
  subCategoryName: string | null | undefined;
  loading: boolean = true;
  currentCategoryName: string = '';
  currentCategoryImage: any;
  currentPage = 1;
  totalPages: number[] = [];
  sortedProducts: Array<{ name: any; price: any }> = [];
  sortBy = 'createdAt';
  sortDirection = 'desc';
  selectedSort: string = 'createdAtDesc';
  currentSortOption!: string;
  currentElementSizeOption!: string;
  private hasQueryParams = false;
  inStockCount: number = 0;
  outOfStockCount: number = 0;
  screenWidth: any;
  currentEmailSeller: string = '';
  display: boolean = false;
  currentCategoryId: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private productService: ProductService,
    private modalService: NgbModal,
    private titleService: Title,
    public toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Handle paramMap changes
    this.route.paramMap.subscribe(
      (paramMap) => {
        this.categoryTitle = paramMap.get('categoryTitle');
        this.subCategoryName = paramMap.get('subCategoryName');
        this.loadSubCategories();
        this.currentCategoryImage = localStorage.getItem('imgCat');
        this.updatePageTitle();
        this.hasQueryParams = false;

        // Load products if no query params present
        if (!this.hasQueryParams) {
          setTimeout(() => {
            this.loadProducts();
          }, 200);
        }
      },
      (error) => {}
    );

    // Handle queryParams changes
    this.route.queryParams.subscribe(
      (params) => {
        this.hasQueryParams = Object.keys(params).length > 0;
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
    if (this.subCategoryName) {
      this.onFilterChange();
    }
  }

  showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message },
    });
  }
  showExpiredSessionDialog(message: string, path: string): void {
    this.dialog.open(ExpiredSessionDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message, path: path },
    });
  }

  showNotFound: boolean = false;

  loadSubCategories(): void {
    if (this.categoryTitle) {
      this.categoryService
        .getSubCategoriesByCategoryTitle(this.categoryTitle)
        .subscribe(
          (subCategories) => {
            this.subCategories = subCategories;
            this.showNotFound = false;
          },
          (error) => {
            if (error.status === 404) {
              setTimeout(() => {
                this.showNotFound = true;
              }, 200);
            }
            if (error.status === 401) {
              this.showExpiredSessionDialog(
                'Session expired. Please log in again.',
                '/login'
              );
            } else {
            }
          }
        );
    }
  }

  loadProducts(): void {
    if (this.subCategoryName) {
      let available: boolean | null = null;
      if (this.filters.inStock && !this.filters.notAvailable) {
        available = true;
      } else if (!this.filters.inStock && this.filters.notAvailable) {
        available = false;
      }

      this.productService
        .getProducts(
          this.subCategoryName,
          this.currentEmailSeller,
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
            if (error.status === 401) {
              this.showExpiredSessionDialog(
                'Session expired. Please log in again.',
                '/login'
              );
            } else {
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

  toggleSubList(categoryName: string): void {
    this.openSubLists[categoryName] = !this.openSubLists[categoryName];
    this.currentCategoryName = this.openSubLists[categoryName]
      ? categoryName
      : '';
    localStorage.getItem('imgCat');
  }

  open(product: any) {
    const modalRef = this.modalService.open(AddToCartModalComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.product = product;
  }

  selectCategory(event: Event, Category: any): void {
    event.stopPropagation();
    this.categoryTitle = Category.categoryTitle;
    this.currentCategoryImage =
      Category.img || 'default-category-image-url.jpg';
    this.currentCategoryName =
      this.categories.find((category) => category.categoryId)?.categoryTitle ||
      'Category';
    localStorage.setItem('currentCategoryImage', this.currentCategoryImage);
    this.updatePageTitle();
    this.router.navigate([], { queryParams: {} }); // Reset query params when selecting a new category
  }

  private updatePageTitle() {
    let pageTitle = '';
    if (this.categoryTitle) {
      pageTitle += `${this.categoryTitle}`;
    }
    if (this.subCategoryName) {
      pageTitle += ` - ${this.subCategoryName}`;
    }
    this.titleService.setTitle(pageTitle);
    return pageTitle;
  }

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.route.snapshot.queryParams, ...params },
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }

  redirectToDetails(id: number) {
    this.router.navigate([`product/details/${id}`]);
  }

  redirectToSubCategory(categoryTitle: any, name: string) {
    this.router.navigate([`categories/${categoryTitle}/${name}`], {
      queryParams: { page: 1, inStock: true, notAvailable: true },
    });
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

  onCategoryChange(catId: any): void {
    const page = 1;
    this.updateQueryParams({ page });
    this.loadProducts();
  }

  onEmailChange(email: string): void {
    this.currentEmailSeller = email;
    const page = 1;
    this.updateQueryParams({ email, page });
    this.loadProducts();
  }

  onFilterChange(): void {
    // Update query params with availability filters
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
        subCategories: this.subCategories,
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
}
