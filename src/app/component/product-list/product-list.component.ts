import { CurrencyPipe, NgClass, NgForOf, NgIf, NgStyle } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductCardComponent } from "../product-card/product-card.component";

import { FormsModule } from "@angular/forms";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from "../../service/category.service";
import { ProductsService } from "../../service/products.service";
import { ToastService } from '../../service/toast.service';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CapitalizePipe } from "../../pipe/capitalize.pipe";
import { ErrorDialogComponent } from "../error-dialog/error-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { CustomRangeSliderComponent } from "../../custom-range-slider/custom-range-slider.component";
import { PaginatedResponse, Product } from "../interface/product";
import { PaginationComponent } from "../../pagination/pagination.component";
import { SortOptionsComponent } from "../../sort-options/sort-options.component";
import { ExpiredSessionDialogComponent } from "../../expired-session-dialog/expired-session-dialog.component";

@Component({
    selector: 'app-product-list',
    standalone: true,
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.css',
    imports: [
    NgForOf,
    NgIf,
    ProductCardComponent,
    SidebarComponent,
    FormsModule,
    CurrencyPipe,
    NgClass,
    NgStyle,
    RouterLink,
    RouterLinkActive,
    MatProgressSpinner,
    CapitalizePipe,
    CustomRangeSliderComponent,
    PaginationComponent,
    SortOptionsComponent
]
})

export class ProductListComponent implements OnInit {
  currentSubCategoryImage: any;
  openSubLists: { [key: string]: boolean } = {};
  @ViewChild('slider') slider!: ElementRef;
  colorOptions: string[] = [
    'red', 'yellow', 'blue', 'green'
  ];

  filters = {
    inStock: true,
    notAvailable: false,
    priceRange: 250,
    minPrice: 0,
    maxPrice: 25000,
    colors: [] as string[],
    sizes: [] as string[]
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
  sortedProducts: Array<{ name: any, price: any }> = [];
  sortBy = 'createdAt';
  sortDirection = 'desc';
  selectedSort: string = 'createdAtDesc';
  currentSortOption!: string;
  private hasQueryParams = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private productService: ProductsService,
    private modalService: NgbModal,
    private titleService: Title,
    public toastService: ToastService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // Handle paramMap changes
    this.route.paramMap.subscribe(paramMap => {
      this.categoryTitle = paramMap.get('categoryTitle');
      this.subCategoryName = paramMap.get('subCategoryName');
      this.loadSubCategories();
      this.currentCategoryImage = localStorage.getItem('imgCat');
      this.updatePageTitle();
      this.hasQueryParams = false;

      // Load products if no query params present
      if (!this.hasQueryParams) {
        setTimeout(() => {
          this.loadProducts()
        }, 200);
      }
    }, error => {
      if (error.status === 403 || error.status === 401) {
        localStorage.removeItem("token");
        this.showExpiredSessionDialog("Your Session Expired",`categroies/${this.categoryTitle}`);
      } else {
        console.error('Error loading subcategories:', error);
      }
    }
  );

    // Handle queryParams changes
    this.route.queryParams.subscribe(params => {
      this.hasQueryParams = Object.keys(params).length > 0;

      this.filters.minPrice = +params['minPrice'] || this.filters.minPrice;
      this.filters.maxPrice = +params['maxPrice'] || this.filters.maxPrice;
      this.filters.colors = params['colors'] ? params['colors'].split(',') : [];
      this.filters.sizes = params['sizes'] ? params['sizes'].split(',') : [];
      this.sortBy = params['sortBy'] || 'createdAt';
      this.sortDirection = params['sortDirection'] || 'desc';
      this.currentPage = +params['page'] || 1;

      // Construct currentSortOption from sortBy and sortDirection
      this.currentSortOption = `${this.sortBy}${this.sortDirection.charAt(0).toUpperCase()}${this.sortDirection.slice(1)}`;

      // Load products based on query params
      if (this.hasQueryParams) {
        this.loadProducts();
      }
    },
    error => {
      if (error.status === 403 || error.status === 401) {
        localStorage.removeItem("token");
        this.showExpiredSessionDialog("Your Session Expired",`categroies/${this.categoryTitle}`);
        setTimeout(() => {
          window.location.reload();
        }, 2000)
      } else {
        console.error('Error loading subcategories:', error);
      }
    }
  );

    // Initialize sortedProducts
    this.sortedProducts = [...this.products];
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

  loadSubCategories(): void {
    if (this.categoryTitle) {
      this.categoryService.getSubCategoriesByCategoryTitle(this.categoryTitle).subscribe(
        subCategories => {
          this.subCategories = subCategories;
        },
        error => {
          if (error.status === 403 || error.status === 401) {
            localStorage.removeItem("token");
            this.showExpiredSessionDialog("Your Session Expired",`categroies/${this.categoryTitle}`);
            setTimeout(() => {
              window.location.reload();
            }, 2000)
          } else {
            console.error('Error loading subcategories:', error);
          }
        }
      );
    }
  }

  loadProducts(): void {
    if (this.subCategoryName) {
      this.productService.getProducts(
        this.subCategoryName,
        this.sortBy,
        this.sortDirection,
        this.filters.minPrice,
        this.filters.maxPrice,
        this.currentPage - 1, // Adjust page number for API
        5,
        this.filters.colors,
        this.filters.sizes
      ).subscribe((response: PaginatedResponse<Product[]>) => {
        this.loading = false;
        this.products = response.content;
        this.currentPage = response.pageable.pageNumber + 1; // Update currentPage
        this.totalPages = Array.from({ length: response.totalPages }, (_, i) => i + 1);
      }, error => {
        if (error.status === 403 || error.status === 401) {
          localStorage.removeItem("token");
          this.showExpiredSessionDialog("Your Session Expired",`categroies/${this.categoryTitle}`);
          setTimeout(() => {
            window.location.reload();
          }, 2000)
        } else {
          console.error('Error loading subcategories:', error);
        }
      });
    } else {
      this.loading = false;
      this.products = [];
    }
  }

  toggleSubList(categoryName: string): void {
    this.openSubLists[categoryName] = !this.openSubLists[categoryName];
    this.currentCategoryName = this.openSubLists[categoryName] ? categoryName : '';
    localStorage.getItem('imgCat');
  }

  open(product: any) {
    const modalRef = this.modalService.open(ProductModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.product = product;
  }

  selectCategory(event: Event, Category: any): void {
    event.stopPropagation();
    this.categoryTitle = Category.categoryTitle;
    this.currentCategoryImage = Category.img || 'default-category-image-url.jpg';
    this.currentCategoryName = this.categories.find(category => category.categoryId)?.categoryTitle || 'Category';
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
      queryParamsHandling: 'merge'  // Merge with existing query params
    });
  }

  redirectToDetails(id: number) {
    this.router.navigate([`product/details/${id}`]);
  }

  redirectToSubCategory(categoryTitle: any, name: string) {
    this.router.navigate([`categories/${categoryTitle}/${name}`]);
  }

  scrollLeft(slider: HTMLElement) {
    slider.scrollBy({ left: -955, behavior: 'smooth' });
  }

  scrollRight(slider: HTMLElement) {
    slider.scrollBy({ left: 955, behavior: 'smooth' });
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
    this.updateQueryParams({ minPrice: this.filters.minPrice, maxPrice: this.filters.maxPrice });
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
    this.updateQueryParams({ colors: this.filters.colors.join(',') });
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
    this.updateQueryParams({ sizes: this.filters.sizes.join(',') });
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.updateQueryParams({ page });
    this.loadProducts();
  }
}
