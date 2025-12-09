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
import { AuthService } from '../../service/auth.service';
import { keyframes } from '@angular/animations';

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
    maxPrice: 250000,
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
  outOfStockCount!: number;
  screenWidth: any;
  currentEmailSeller: string = '';
  display: boolean = false;
  currentCategoryId: any;
  isloading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private productService: ProductService,
    private modalService: NgbModal,
    private titleService: Title,
    public toastService: ToastService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Trigger only when category changes
    this.route.paramMap.subscribe((paramMap) => {
      this.loading = true;
      this.isloading = true;
      this.products = [];

      this.categoryTitle = paramMap.get('categoryTitle');
      this.subCategoryName = paramMap.get('subCategoryName');

      this.loadSubCategories();
      this.currentCategoryImage = localStorage.getItem('imgCat');

      this.updatePageTitle();
      this.hasQueryParams = false;

      // Delay so queryParams subscription fires first
      setTimeout(() => {
        this.loadProducts();
      }, 50);
    });

    // Query params should handle loading products ONLY
    this.route.queryParams.subscribe((params) => {
      this.hasQueryParams = Object.keys(params).length > 0;

      this.currentPage = params['page'] ? +params['page'] : 1;

      this.filters.minPrice = +params['minPrice'] || this.filters.minPrice;
      this.filters.maxPrice = +params['maxPrice'] || this.filters.maxPrice;
      this.filters.colors = params['colors'] ? params['colors'].split(',') : [];
      this.filters.sizes = params['sizes'] ? params['sizes'].split(',') : [];

      this.sortBy = params['sortBy'] || 'createdAt';
      this.sortDirection = params['sortDirection'] || 'desc';
      this.currentElementSizeOption = params['pageSize'] || 20;

      this.filters.inStock = params['inStock'] === 'true';
      this.filters.notAvailable = params['notAvailable'] === 'true';

      this.currentSortOption = `${this.sortBy}${this.sortDirection
        .charAt(0)
        .toUpperCase()}${this.sortDirection.slice(1)}`;
      if (params['inStock'] == 'false' && params['notAvailable'] == 'false') {
        this.products = [];
        this.inStockCount = 0;
        this.outOfStockCount = 0;
        this.isloading = false;
        return;
      }
    });
  }

  isActive(subCategory: any): boolean {
    try {
      const urlTree = this.router.parseUrl(this.router.url);
      const primary = urlTree.root.children['primary'];
      const segments = primary?.segments.map((s) => s.path) || [];

      // expected structure: ['categories', '{categoryTitle}', '{subCategoryName}']
      if (segments.length >= 3 && segments[0] === 'categories') {
        const currentCategory = segments[1];
        const currentSub = segments[2];
        return (
          currentCategory === this.categoryTitle &&
          currentSub === subCategory.name
        );
      }
      return false;
    } catch (e) {
      // fallback (and helpful for debugging)
      console.error('isActive error', e);
      return false;
    }
  }
  showNotFound: boolean = false;

  loadSubCategories(): void {
    if (this.categoryTitle) {
      this.categoryService
        .getSubCategoriesByCategoryTitle(this.categoryTitle)
        .subscribe(
          (subCategories) => {
            this.loading = false;
            this.subCategories = subCategories;
            this.showNotFound = false;
            this.isloading = false;
          },
          (error) => {
            if (error.status === 404) {
              setTimeout(() => {
                this.loading = false;
                this.showNotFound = true;
              }, 200);
            }
          }
        );
    }
  }

  loadStockCounts(): void {
    this.productService
      .getProducts(
        this.subCategoryName || '',
        this.currentEmailSeller,
        this.sortBy,
        this.sortDirection,
        0, // no minPrice
        99999, // no maxPrice
        0, // page
        9999, // large size to get all
        [], // no colors
        [], // no sizes
        null // no availability filtering
      )
      .subscribe((response) => {
        const fullList = response.content;

        const stockCounts = ProductCardComponent.getStockCounts(fullList);
        this.inStockCount = stockCounts.inStockCount;
        this.outOfStockCount = stockCounts.outOfStockCount;
      });
  }

  loadProducts(): void {
    this.isloading = true;

    if (
      (this.subCategoryName && this.filters.inStock == true) ||
      this.filters.notAvailable == true
    ) {
      let available: boolean | null = null;
      if (this.filters.inStock && !this.filters.notAvailable) {
        available = true;
      } else if (!this.filters.inStock && this.filters.notAvailable) {
        available = false;
      }

      this.productService
        .getProducts(
          this.subCategoryName || '',
          this.currentEmailSeller,
          this.sortBy,
          this.sortDirection,
          this.filters.minPrice,
          this.filters.maxPrice,
          this.currentPage - 1,
          this.currentElementSizeOption,
          this.filters.colors,
          this.filters.sizes,
          available
        )
        .subscribe(
          (response: PaginatedResponse<Product[]>) => {
            // Store visible products
            this.products = response.content;

            // ❗ ALWAYS fetch full stock data separately
            this.loadStockCounts();

            if (response.content && response.content.length > 0) {
              this.loading = false;

              if (response.content.length > 1) {
                this.display = false;
              } else {
                this.display = true;
              }

              this.currentCategoryId = response.content[0].subCategory.id;
            }

            this.currentPage = response.pageable.pageNumber + 1;
            this.totalPages = Array.from(
              { length: response.totalPages },
              (_, i) => i + 1
            );

            this.isloading = false;
          },
          (error) => {
            if (error.status === 404) {
              this.showNotFound = true;
            }
          }
        );
    } else {
      this.products = [];
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
    this.isloading = true;
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
    this.isloading = true;
    this.currentEmailSeller = email;
    const page = 1;
    this.updateQueryParams({ email, page });
    this.loadProducts();
  }

  onFilterChange(): void {
    this.isloading = true;
    // Update query params with availability filters
    const page = 1;
    this.updateQueryParams({
      inStock: this.filters.inStock ? 'true' : 'false',
      notAvailable: this.filters.notAvailable ? 'true' : 'false',
      page,
    });
    if (this.filters.inStock == false && this.filters.notAvailable == false) {
      this.products = [];
      this.inStockCount = 0;
      this.outOfStockCount = 0;
      this.isloading = false;
      return;
    }
    this.loadProducts();
  }

  onPriceRangeChange(): void {
    this.isloading = true;
    const page = 1;
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
      page,
    });
    this.loadProducts();
  }

  onColorChange(color: string, event: Event): void {
    this.isloading = true;
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
    this.isloading = true;
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
