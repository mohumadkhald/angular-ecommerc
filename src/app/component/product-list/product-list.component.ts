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
import { combineLatest } from 'rxjs';

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
  colorOptions: string[] = ['white', 'black', 'red', 'yellow', 'blue', 'green'];

  filters = {
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
  ) {}

  /* ========================================================= */
  /* ======================== INIT ============================ */
  /* ========================================================= */

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParams]).subscribe(
      ([paramMap, queryParams]) => {
        /* ---------- ROUTE PARAMS ---------- */
        this.categoryTitle = paramMap.get('categoryTitle');

        this.subCategoryName = paramMap.get('subCategoryName');

        this.loading = true;
        this.loadSubCategories();
        this.currentCategoryImage = localStorage.getItem('imgCat');
        this.updatePageTitle();
        /* ---------- QUERY PARAMS ---------- */
        this.currentPage = +queryParams['page'] || 1;

        this.filters.minPrice = +queryParams['minPrice'] || 0;
        this.filters.maxPrice = +queryParams['maxPrice'] || 250000;
        this.filters.colors = queryParams['colors']?.split(',') || [];
        this.filters.sizes = queryParams['sizes']?.split(',') || [];

        this.filters.inStock = queryParams['inStock'] !== 'false';
        this.filters.notAvailable = queryParams['notAvailable'] !== 'false';

        this.sortBy = queryParams['sortBy'] || 'createdAt';
        this.sortDirection = queryParams['sortDirection'] || 'desc';

        this.currentSortOption = `${
          this.sortBy
        }${this.sortDirection[0].toUpperCase()}${this.sortDirection.slice(1)}`;

        this.currentElementSizeOption = queryParams['pageSize'] || 20;

        /* ---------- NOW IT IS SAFE ---------- */
        if (this.subCategoryName) this.loadProducts();
      }
    );
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
          this.subCategories = res;
          this.loading = false;
        },
        error: () => {
          this.showNotFound = true;
          this.loading = false;
        },
      });
  }

  loadProducts(): void {
    this.isloading = true;

    let available: boolean | null = null;
    if (this.filters.inStock && !this.filters.notAvailable) available = true;
    if (!this.filters.inStock && this.filters.notAvailable) available = false;

    if (!this.filters.inStock && !this.filters.notAvailable) {
      this.products = [];
      this.inStockCount = 0;
      this.outOfStockCount = 0;
      this.isloading = false;
      return;
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
      .subscribe((response: any) => {
        this.products = response.content || [];
        this.currentPage = response.pageable.pageNumber + 1;
        this.totalPages = Array.from(
          { length: response.totalPages },
          (_, i) => i + 1
        );

        this.display = this.products.length <= 1;
        this.loadStockCounts();

        this.isloading = false;
      });
  }

  loadStockCounts(): void {
    this.productService
      .getProducts(
        this.subCategoryName || '',
        '',
        'createdAt',
        'desc',
        0,
        999999,
        0,
        9999,
        [],
        [],
        null
      )
      .subscribe((res: any) => {
        const counts = ProductCardComponent.getStockCounts(res.content);
        this.inStockCount = counts.inStockCount;
        this.outOfStockCount = counts.outOfStockCount;
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

    this.updateQueryParams({ sortBy, sortDirection, page: 1 });
  }

  onSizeElementChange(value: string) {
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
  onResize() {}

  onPriceRangeChange() {
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
      page: 1,
    });
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

  redirectToSubCategory(categoryTitle: any, name: string) {
    this.router.navigate([`categories/${categoryTitle}/${name}`], {
      queryParams: { page: 1, inStock: true, notAvailable: true },
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
}
