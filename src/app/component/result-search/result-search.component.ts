import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginatedResponse, Product } from '../../interface/product';
import { ProductService } from '../../service/product.service';
import { CustomRangeSliderComponent } from '../custom-range-slider/custom-range-slider.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SortOptionsComponent } from '../sort-options/sort-options.component';

@Component({
  selector: 'app-result-search',
  standalone: true,
  templateUrl: './result-search.component.html',
  styleUrl: './result-search.component.css',
  imports: [
    NgFor,
    NgIf,
    ProductCardComponent,
    FormsModule,
    PaginationComponent,
    SortOptionsComponent,
    CustomRangeSliderComponent,
  ],
})
export class ResultSearchComponent implements OnInit {
  products: Product[] = [];
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

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.categoryTitle = params['category'] || '';
      this.productName = params['search'] || '';
      this.filters.minPrice = +params['minPrice'] || this.filters.minPrice;
      this.filters.maxPrice = +params['maxPrice'] || this.filters.maxPrice;
      this.filters.colors = params['colors'] ? params['colors'].split(',') : [];
      this.filters.sizes = params['sizes'] ? params['sizes'].split(',') : [];
      this.sortBy = params['sortBy'] || 'createdAt';
      this.sortDirection = params['sortDirection'] || 'desc';

      // Construct currentSortOption from sortBy and sortDirection
      this.currentSortOption = `${this.sortBy}${this.sortDirection
        .charAt(0)
        .toUpperCase()}${this.sortDirection.slice(1)}`;

      this.getProducts(
        this.categoryTitle,
        this.productName,
        this.sortBy,
        this.sortDirection,
        this.filters.minPrice,
        this.filters.maxPrice
      );
    });
  }

  getProducts(
    categoryName: string,
    productName: string,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    minPrice: number = 0,
    maxPrice: number = 25000,
    page: number = 0,
    pageSize: number = 5
  ): void {
    this.productService
      .getProductsByCategoryAndProductName(
        categoryName,
        productName,
        sortBy,
        sortDirection,
        minPrice,
        maxPrice,
        page,
        pageSize,
        this.filters.colors,
        this.filters.sizes
      )
      .subscribe((response: PaginatedResponse<Product[]>) => {
        this.products = response.content;
        this.currentPage = response.pageable.pageNumber + 1;
        this.totalPages = Array.from(
          { length: response.totalPages },
          (_, i) => i + 1
        );
      });
  }

  onPageChange(page: number): void {
    this.updateQueryParams({ page });
    this.getProducts(
      this.categoryTitle,
      this.productName,
      this.sortBy,
      this.sortDirection,
      this.filters.minPrice,
      this.filters.maxPrice,
      page - 1
    );
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    let newSortBy = '';
    let newSortDirection = '';

    switch (value) {
      case 'createdAtAsc':
        newSortBy = 'createdAt';
        newSortDirection = 'asc';
        break;
      case 'createdAtDesc':
        newSortBy = 'createdAt';
        newSortDirection = 'desc';
        break;
      case 'priceAsc':
        newSortBy = 'price';
        newSortDirection = 'asc';
        break;
      case 'priceDesc':
        newSortBy = 'price';
        newSortDirection = 'desc';
        break;
    }

    this.sortBy = newSortBy;
    this.sortDirection = newSortDirection;
    this.currentSortOption = `${newSortBy}${newSortDirection
      .charAt(0)
      .toUpperCase()}${newSortDirection.slice(1)}`;

    this.updateQueryParams({
      sortBy: newSortBy,
      sortDirection: newSortDirection,
    });
    this.getProducts(
      this.categoryTitle,
      this.productName,
      newSortBy,
      newSortDirection,
      this.filters.minPrice,
      this.filters.maxPrice
    );
  }

  onPriceRangeChange(): void {
    this.updateQueryParams({
      minPrice: this.filters.minPrice,
      maxPrice: this.filters.maxPrice,
    });
    this.getProducts(
      this.categoryTitle,
      this.productName,
      this.sortBy,
      this.sortDirection,
      this.filters.minPrice,
      this.filters.maxPrice
    );
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
    this.getProducts(
      this.categoryTitle,
      this.productName,
      this.sortBy,
      this.sortDirection,
      this.filters.minPrice,
      this.filters.maxPrice
    );
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
    this.getProducts(
      this.categoryTitle,
      this.productName,
      this.sortBy,
      this.sortDirection,
      this.filters.minPrice,
      this.filters.maxPrice
    );
  }

  updateQueryParams(params: any): void {
    const queryParams = { ...this.route.snapshot.queryParams, ...params };
    this.router.navigate([], { queryParams });
  }
}
