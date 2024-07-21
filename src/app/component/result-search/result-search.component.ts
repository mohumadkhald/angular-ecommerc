import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../service/products.service';
import { Product, PaginatedResponse } from '../interface/product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { PaginationComponent } from "../../pagination/pagination.component";
import { SortOptionsComponent } from "../../sort-options/sort-options.component";
import { CustomRangeSliderComponent } from "../../custom-range-slider/custom-range-slider.component";

@Component({
    selector: 'app-result-search',
    standalone: true,
    templateUrl: './result-search.component.html',
    styleUrl: './result-search.component.css',
    imports: [NgFor, NgIf, ProductCardComponent, FormsModule, PaginationComponent, SortOptionsComponent, CustomRangeSliderComponent]
})

export class ResultSearchComponent implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  totalPages: number[] = [];  colorOptions: string[] = [
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
  subCategoryName!: string;

  constructor(
    private productService: ProductsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const categoryName = params.get('categoryTitle') || '';
      const productName = params.get('productName') || '';
      this.getProducts(categoryName, productName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice);
    });
  }

  getProducts(categoryName: string, productName: string, sortBy: string = 'createdAt', sortDirection: string = 'desc', minPrice: number = 0, maxPrice: number = 2500, page: number = 0, pageSize: number = 5): void {
    this.productService.getProductsByCategoryAndProductName(categoryName, productName, sortBy, sortDirection, minPrice, maxPrice, page, pageSize, this.filters.colors, this.filters.sizes)
      .subscribe((response: PaginatedResponse<Product[]>) => {
        this.products = response.content;
        this.currentPage = response.pageable.pageNumber + 1;
        this.totalPages = Array.from({ length: response.totalPages }, (_, i) => i + 1);
      });
  }

  onPageChange(page: number): void {
    const categoryName = this.route.snapshot.paramMap.get('categoryTitle') || '';
    const productName = this.route.snapshot.paramMap.get('productName') || '';
    this.getProducts(categoryName, productName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice, page-1);
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

    const categoryName = this.route.snapshot.paramMap.get('categoryTitle') || '';
    const productName = this.route.snapshot.paramMap.get('productName') || '';
    this.getProducts(categoryName, productName, sortBy, sortDirection, this.filters.minPrice, this.filters.maxPrice);
  }

  onPriceRangeChange(): void {
    const categoryName = this.route.snapshot.paramMap.get('categoryTitle') || '';
    const productName = this.route.snapshot.paramMap.get('productName') || '';
    this.getProducts(categoryName, productName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice);
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
    const categoryName = this.route.snapshot.paramMap.get('categoryTitle') || '';
    const productName = this.route.snapshot.paramMap.get('productName') || '';
    this.getProducts(categoryName, productName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice);
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
    const categoryName = this.route.snapshot.paramMap.get('categoryTitle') || '';
    const productName = this.route.snapshot.paramMap.get('productName') || '';
    this.getProducts(categoryName, productName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice);
  }
}