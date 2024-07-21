import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../service/products.service';
import { Product, PaginatedResponse } from '../interface/product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { PaginationComponent } from "../../pagination/pagination.component";

@Component({
    selector: 'app-result-search',
    standalone: true,
    templateUrl: './result-search.component.html',
    styleUrl: './result-search.component.css',
    imports: [NgFor, NgIf, ProductCardComponent, FormsModule, PaginationComponent]
})

export class ResultSearchComponent implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  totalPages: number[] = [];

  constructor(
    private productService: ProductsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const categoryName = params.get('categoryTitle') || '';
      const productName = params.get('productName') || '';
      this.getProducts(categoryName, productName);
    });
  }

  getProducts(categoryName: string, productName: string, page: number = 0, pageSize: number = 5): void {
    this.productService.getProductsByCategoryAndProductName(categoryName, productName, page, pageSize)
      .subscribe((response: PaginatedResponse<Product[]>) => {
        this.products = response.content;
        this.currentPage = response.pageable.pageNumber + 1;
        this.totalPages = Array.from({ length: response.totalPages }, (_, i) => i + 1);
      });
  }

  onPageChange(page: number): void {
    const categoryName = this.route.snapshot.paramMap.get('categoryTitle') || '';
    const productName = this.route.snapshot.paramMap.get('productName') || '';
    this.getProducts(categoryName, productName, page - 1);
  }
}