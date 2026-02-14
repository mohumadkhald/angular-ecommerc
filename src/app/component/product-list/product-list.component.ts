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
  ParamMap,
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
import { combineLatest, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  imports: [
    ProductCardComponent,
    FormsModule,
    CommonModule,
    RouterLink,
    MatProgressSpinner,
    CapitalizePipe,
    CustomRangeSliderComponent,
    PaginationComponent,
    SortOptionsComponent,
  ],
})
export class ProductListComponent implements OnInit {
  @ViewChild('slider') slider!: ElementRef;

  /* -------------------- DATA -------------------- */
  categories: any[] = [];
  subCategories: any[] = [];
  products: any[] = [];

  categoryTitle!: string | null;
  subCategoryName!: string | null;

  currentCategoryImage: any;
  currentCategoryId: any;
  currentEmailSeller: string = '';

  loading = true;
  isloading = false;
  showNotFound = false;
  display = false;

  /* -------------------- FILTERS -------------------- */
  colorOptions: string[] = ['white', 'black', 'red', 'yellow', 'blue', 'green', 'purple', 'orange', 'gray', 'pink', 'brown'];

  filters = {
    subCategoryName: null,
    inStock: true,
    notAvailable: true,
    minPrice: 0,
    maxPrice: 250000,
    colors: [] as string[],
    sizes: [] as string[],
  };

  inStockCount = 0;
  outOfStockCount = 0;

  /* -------------------- SORT & PAGINATION -------------------- */
  currentPage = 1;
  totalPages: number[] = [];
  currentElementSizeOption: any = 20;

  sortBy = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentSortOption = 'createdAtDesc';

  /* -------------------- UI -------------------- */
  openSubLists: { [key: string]: boolean } = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private productService: ProductService,
    private modalService: NgbModal,
    private titleService: Title,
    private dialog: MatDialog,
    public toastService: ToastService,
    private authService: AuthService
  ) { }

  /* ========================================================= */
  /* ======================== INIT ============================ */
  /* ========================================================= */

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => this.handleRouteParams(params));
    this.route.queryParamMap.subscribe((params) =>
      this.handleQueryParams(params)
    );
  }

  private initialized = false;
  // ------------------- ROUTE PARAM HANDLING -------------------
  private handleRouteParams(params: ParamMap): void {
    const newCategory = params.get('categoryTitle');
    const newSubCategory = params.get('subCategoryName');

    const categoryChanged = newCategory !== this.categoryTitle;
    const subCategoryChanged = newSubCategory !== this.subCategoryName;

    this.categoryTitle = newCategory;
    this.subCategoryName = newSubCategory;

    this.updatePageTitle();

    if (categoryChanged && this.categoryTitle) {
      this.loadSubCategories();
    }

    // Always reload products if either category or subcategory changes
    if (categoryChanged || subCategoryChanged) {
      this.currentPage = 1;
      this.loadProducts();
    }
  }


  // ------------------- QUERY PARAM HANDLING -------------------
  private handleQueryParams(params: ParamMap): void {
    this.parseFilters(params);
    this.parseSorting(params);
    this.parsePagination(params);

    if (!this.initialized) {
      this.initialized = true;
    }

    if (this.subCategoryName) {
      this.loadProducts();
    }
  }

  // ------------------- FILTERS -------------------
  private parseFilters(params: ParamMap): void {
    this.filters.inStock = params.get('inStock') === 'true';
    this.filters.notAvailable = params.get('notAvailable') === 'true';
    this.filters.minPrice = Number(params.get('minPrice')) || 0;
    this.filters.maxPrice = Number(params.get('maxPrice')) || 250000;

    this.filters.colors = this.parseCommaSeparated(params.get('colors'));
    this.filters.sizes = this.parseCommaSeparated(params.get('sizes'));
  }

  // ------------------- SORTING -------------------
  private parseSorting(params: ParamMap): void {
    const sortBy = params.get('sortBy');
    const sortDirection = params.get('sortDirection') as 'asc' | 'desc' | null;

    if (sortBy) this.sortBy = sortBy;
    if (sortDirection) this.sortDirection = sortDirection;

    this.currentSortOption =
      this.getSortOption(this.sortBy, this.sortDirection) || 'createdAtDesc';
  }
  private getSortOption(
    sortBy: string,
    sortDirection: 'asc' | 'desc' | null
  ): string | null {
    if (sortBy === 'createdAt')
      return sortDirection === 'asc' ? 'createdAtAsc' : 'createdAtDesc';
    if (sortBy === 'price')
      return sortDirection === 'asc' ? 'priceAsc' : 'priceDesc';
    return null;
  }

  // ------------------- PAGINATION -------------------
  private parsePagination(params: ParamMap): void {
    const page = Number(params.get('page'));
    this.currentPage = page && page > 0 ? page : 1;

    const pageSize = Number(params.get('pageSize'));
    this.currentElementSizeOption = pageSize || 20;
  }

  // ------------------- UTIL -------------------
  private parseCommaSeparated(value: string | null): string[] {
    return value ? value.split(',') : [];
  }

  /* ========================================================= */
  /* ===================== API CALLS ========================== */
  /* ========================================================= */

  loadSubCategories(): void {
    if (!this.categoryTitle) return;

    this.categoryService
      .getSubCategoriesByCategoryTitle(this.categoryTitle)
      .subscribe({
        next: (res) => {
          this.subCategories = res.subCategoryDtos;
          this.loading = false;
          // console.log(res);
        },
        error: () => {
          this.showNotFound = true;
          this.loading = false;
        },
      });
  }

  loadProducts(): void {
    this.isloading = true;

    // Determine availability filter
    let available: boolean | null = null;

    if (this.filters.inStock && !this.filters.notAvailable) {
      available = true;
    } else if (!this.filters.inStock && this.filters.notAvailable) {
      available = false;
    }

    // // If neither checkbox is selected → reset
    // if (!this.filters.inStock && !this.filters.notAvailable) {
    //   this.products = [];
    //   this.inStockCount = 0;
    //   this.outOfStockCount = 0;
    //   this.isloading = false;
    //   return;
    // }

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
      .subscribe({
        next: (response: any) => {
          const products = response?.content || [];

          this.products = products;
          this.currentPage = response.pageable.pageNumber + 1;
          this.totalPages = Array.from(
            { length: response.totalPages },
            (_, i) => i + 1
          );

          // Stock counts
          this.inStockCount = products.filter(
            (p: { inStock: any }) => p.inStock
          ).length;
          this.outOfStockCount = products.length - this.inStockCount;

          this.display = products.length <= 1;
          this.isloading = false;

          // console.log(this.inStockCount, this.outOfStockCount);
        },
        error: () => {
          this.products = [];
          this.inStockCount = 0;
          this.outOfStockCount = 0;
          this.isloading = false;
        },
      });
  }

  /* ========================================================= */
  /* ===================== ACTIONS ============================ */
  /* ========================================================= */

  onSortChange(value: string): void {
    let sortBy = 'createdAt';
    let sortDirection: 'asc' | 'desc' = 'desc';

    if (value === 'createdAtAsc') sortDirection = 'asc';
    if (value === 'priceAsc') {
      sortBy = 'price';
      sortDirection = 'asc';
    }
    if (value === 'priceDesc') {
      sortBy = 'price';
      sortDirection = 'desc';
    }

    this.isloading = true;
    this.updateQueryParams({ sortBy, sortDirection, page: 1 });
  }

  onSizeElementChange(value: string) {
    this.isloading = true;
    this.updateQueryParams({ pageSize: value, page: 1 });
  }

  onColorChange(color: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.filters.colors.includes(color)) {
        this.filters.colors.push(color);
      }
    } else {
      this.filters.colors = this.filters.colors.filter((c) => c !== color);
    }

    this.updateQueryParams({
      colors: this.filters.colors.length ? this.filters.colors.join(',') : null,
      page: 1,
    });
  }

  onSizeChange(size: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.filters.sizes.includes(size)) {
        this.filters.sizes.push(size);
      }
    } else {
      this.filters.sizes = this.filters.sizes.filter((s) => s !== size);
    }

    this.updateQueryParams({
      sizes: this.filters.sizes.length ? this.filters.sizes.join(',') : null,
      page: 1,
    });
  }

  onFilterChange() {
    this.updateQueryParams({
      inStock: this.filters.inStock,
      notAvailable: this.filters.notAvailable,
      page: 1,
    });
  }

  onPageChange(page: number) {
    this.updateQueryParams({ page });
  }

  open(product: any) {
    const ref = this.modalService.open(AddToCartModalComponent, {
      size: 'lg',
      centered: true,
    });
    ref.componentInstance.product = product;
  }

  redirectToDetails(id: number) {
    this.router.navigate([`product/details/${id}`]);
  }

  /* ========================================================= */
  /* ===================== HELPERS ============================ */
  /* ========================================================= */

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  private updatePageTitle(): void {
    this.titleService.setTitle(
      `${this.categoryTitle || ''} ${this.subCategoryName || ''}`
    );
  }

  scrollLeft(slider: HTMLElement) {
    slider.scrollBy({ left: -slider.offsetWidth, behavior: 'smooth' });
  }

  scrollRight(slider: HTMLElement) {
    slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
  }

  @HostListener('window:resize')
  onResize() { }

  onPriceRangeChange() {
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
      page: 1,
    });
  }
  openFilterModal(sub: any) {
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
        subca: this.subCategoryName,
        instock: this.filters.inStock,
        notavailable: this.filters.notAvailable
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.filters) {
          this.filters = { ...this.filters, ...result.filters };
        }

        if (result.subCategoryName && this.categoryTitle) {
          // Include all filters in queryParams
          this.redirectToSubCategory(this.categoryTitle, result.subCategoryName, this.filters);
        }
      }
    });

  }

  onEmailChange(email: string): void {
    this.isloading = true;
    this.currentEmailSeller = email;
    const page = 1;
    this.updateQueryParams({ email, page });
    this.loadProducts();
  }

  redirectToSubCategory(categoryTitle: string, subName: string, filters?: any) {
    this.router.navigate([`categories/${categoryTitle}/${subName}`], {
      queryParams: {
        page: 1,
        inStock: filters?.inStock ?? true,
        notAvailable: filters?.notAvailable ?? true,
        minPrice: filters?.minPrice ?? 0,
        maxPrice: filters?.maxPrice ?? 250000,
        colors: filters?.colors?.length ? filters.colors.join(',') : null,
        sizes: filters?.sizes?.length ? filters.sizes.join(',') : null,
      },
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

  onCategoryChange(catId: any): void {
    const page = 1;
    this.updateQueryParams({ page });
    this.loadProducts();
  }
}
