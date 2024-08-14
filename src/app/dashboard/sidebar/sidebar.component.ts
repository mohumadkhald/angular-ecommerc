import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorDialogComponent } from '../../component/error-dialog/error-dialog.component';
import { ExpiredSessionDialogComponent } from '../../component/expired-session-dialog/expired-session-dialog.component';
import { ProductCardComponent } from '../../component/product-card/product-card.component';
import { PaginatedResponse, Product } from '../../interface/product';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../service/toast.service';
import { CustomRangeSliderComponent } from "../../component/custom-range-slider/custom-range-slider.component";
import { ProductsService } from '../../dashboard-service/products.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule, CustomRangeSliderComponent],
templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  showFilter:boolean = false
  currentSubCategoryImage: any;
  openSubLists: { [key: string]: boolean } = {};
  // @ViewChild('slider') slider!: ElementRef;
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
  private hasQueryParams = false;
  numElement: number = 10;
  inStockCount: number = 0;
  outOfStockCount: number = 0;
  emailQuery: string = '';
  nameQuery: string = '';
screenWidth: any;

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

  getPageTitle(): string {
    return this.titleService.getTitle();
  }

  ngOnInit(): void {

    this.getPageTitle()
    // Handle paramMap changes
    this.route.paramMap.subscribe(
      (paramMap) => {
        this.categoryTitle = paramMap.get('categoryTitle');
        this.subCategoryName = paramMap.get('subCategoryName');
        this.loadSubCategories();
        this.currentCategoryImage = localStorage.getItem('imgCat');
        this.hasQueryParams = false;

        // Load products if no query params are present
        if (!this.hasQueryParams) {
          setTimeout(() => {
            this.loadProducts();
          }, 200);
        }
      },
      (error) => {
        console.error('Error handling paramMap:', error);
      }
    );

    // Handle queryParams changes
    this.route.queryParams.subscribe(
      (params) => {
        this.hasQueryParams = Object.keys(params).length > 0;
        this.currentPage = params['page'] ? +params['page'] : 1;

        this.filters.minPrice = +params['minPrice'] || this.filters.minPrice;
        this.filters.maxPrice = +params['maxPrice'] || this.filters.maxPrice;
        this.filters.colors = params['colors'] ? params['colors'].split(',') : [];
        this.filters.sizes = params['sizes'] ? params['sizes'].split(',') : [];
        this.sortBy = params['sortBy'] || 'createdAt';
        this.sortDirection = params['sortDirection'] || 'desc';

        // Initialize inStock and notAvailable filters
        this.filters.inStock = params['inStock'] === 'true';
        this.filters.notAvailable = params['notAvailable'] === 'true';

        // Construct currentSortOption from sortBy and sortDirection
        this.currentSortOption = `${this.sortBy}${this.sortDirection.charAt(0).toUpperCase()}${this.sortDirection.slice(1)}`;

        // Load products based on query params
        if (this.hasQueryParams) {
          this.loadProducts();
        }
      },
      (error) => {
        console.error('Error handling queryParams:', error);
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
      this.categoryService
        .getSubCategoriesByCategoryTitle(this.categoryTitle)
        .subscribe(
          (subCategories) => {
            this.subCategories = subCategories;
            this.showNotFound = false;
          },
          (error) => {
            if(error.status === 404) {
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
    }
  }
  showNotFound: boolean = false;


  loadProducts(): void {
    if (this.subCategoryName) {
      let available: boolean | null = null;
      if (this.filters.inStock && !this.filters.notAvailable) {
        available = true;
      } else if (!this.filters.inStock && this.filters.notAvailable) {
        available = false;
      }

      this.productService
        .getAllProducts(
          this.sortBy,
          this.sortDirection,
          this.filters.minPrice,
          this.filters.maxPrice,
          this.filters.colors,
          this.filters.sizes,
          this.currentPage - 1, // Adjust page number for API
          this.numElement,
          this.emailQuery,
          this.nameQuery,
          available
        )
        .subscribe(
          (response: PaginatedResponse<Product[]>) => {
            this.loading = false;
            this.products = response.content;
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
    this.router.navigate([`categories/${categoryTitle}/${name}`]);
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

  onFilterChange(): void {
    // Update query params with availability filters
    this.updateQueryParams({
      inStock: this.filters.inStock ? 'true' : null,
      notAvailable: this.filters.notAvailable ? 'true' : null,
    });
    this.loadProducts();
  }

  onPriceRangeChange(): void {
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
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
  scrollLeft(slider: HTMLElement) {
    const scrollAmount = (slider.offsetWidth)-(slider.offsetWidth * 0.01);
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }
  
  scrollRight(slider: HTMLElement) {
    const scrollAmount = (slider.offsetWidth)-(slider.offsetWidth * 0.01);
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
  
}
