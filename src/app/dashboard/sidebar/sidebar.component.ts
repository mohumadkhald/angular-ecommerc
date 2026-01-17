import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  Router,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../service/toast.service';
import { CustomRangeSliderComponent } from '../../component/custom-range-slider/custom-range-slider.component';
import { ProductsService } from '../../dashboard-service/products.service';
import { UsersService } from '../../dashboard-service/users.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule,
    CustomRangeSliderComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  showFilter: boolean = false;
  currentSubCategoryImage: any;
  openSubLists: { [key: string]: boolean } = {};
  // @ViewChild('slider') slider!: ElementRef;
  colorOptions: string[] = ['white', 'black', 'red', 'yellow', 'blue', 'green'];

  filters = {
    inStock: true, // ✅ checked by default
    notAvailable: true, // ✅ checked by default
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
  subCategory: string = '';
  nameQuery: string = '';
  screenWidth: any;
  userCount: any;
  page!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    public toastService: ToastService,
  ) {}

  getPageTitle(): string {
    return this.titleService.getTitle();
  }

  ngOnInit(): void {
    this.getPageTitle();
    // Handle paramMap changes
    this.route.paramMap.subscribe(
      (paramMap) => {
        this.categoryTitle = paramMap.get('categoryTitle');
        this.subCategoryName = paramMap.get('subCategoryName');
        this.hasQueryParams = false;

        // Load products if no query params are present
        if (!this.hasQueryParams) {
          setTimeout(() => {}, 200);
        }
      },
      (error) => {
        console.error('Error handling paramMap:', error);
      },
    );

    // Handle queryParams changes
    this.route.queryParams.subscribe((params) => {
      this.hasQueryParams = Object.keys(params).length > 0;
      this.currentPage = params['page'] ? +params['page'] : 1;

      this.filters.minPrice = +params['minPrice'] || this.filters.minPrice;
      this.filters.maxPrice = +params['maxPrice'] || this.filters.maxPrice;
      this.filters.colors = params['colors'] ? params['colors'].split(',') : [];
      this.filters.sizes = params['sizes'] ? params['sizes'].split(',') : [];
      this.sortBy = params['sortBy'] || 'createdAt';
      this.sortDirection = params['sortDirection'] || 'desc';

      // Only override if param exists
      if (params['inStock'] !== undefined) {
        this.filters.inStock = params['inStock'] === 'true';
      }
      if (params['notAvailable'] !== undefined) {
        this.filters.notAvailable = params['notAvailable'] === 'true';
      }
    });

    // Initialize sortedProducts
    this.sortedProducts = [...this.products];
  }

  showNotFound: boolean = false;

  private updateQueryParams(params: any): void {
    const cleanedParams = Object.keys(params).reduce((acc, key) => {
      const value = params[key];

      acc[key] =
        value === undefined || value === null || value === ''
          ? null // this REMOVES the param from the URL
          : value;

      return acc;
    }, {} as any);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cleanedParams,
      queryParamsHandling: 'merge',
    });
  }

  onFilterChange() {
    this.updateQueryParams({
      inStock: this.filters.inStock,
      notAvailable: this.filters.notAvailable,
    });
  }

  onPriceRangeChange(): void {
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
    });
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
  }

  scrollLeft(slider: HTMLElement) {
    const scrollAmount = slider.offsetWidth - slider.offsetWidth * 0.01;
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  scrollRight(slider: HTMLElement) {
    const scrollAmount = slider.offsetWidth - slider.offsetWidth * 0.01;
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}
