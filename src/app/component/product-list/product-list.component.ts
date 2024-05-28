import {Component, OnInit} from '@angular/core';
import {CurrencyPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ProductCardComponent} from "../product-card/product-card.component";

import {SidebarComponent} from "../../sidebar/sidebar.component";
import {FormsModule} from "@angular/forms";
import {CategoryService} from "../../category.service";
import {ProductsService} from "../services/products.service";
import {Product} from "../interface/product";
import {ActivatedRoute, RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ProductCardComponent,
    SidebarComponent,
    FormsModule,
    CurrencyPipe,
    NgClass,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})

export class ProductListComponent implements OnInit {
  title = 'ProductList';
  openSubLists: { [key: string]: boolean } = {};
  filters = {
    inStock: true,
    notAvailable: false,
    priceRange: 250
  };

  categories: any[] = [];
  subCategories: any[] = [];
  products: any[] = [];

  constructor(private categoryService: CategoryService, private productService: ProductsService, private route : ActivatedRoute) {
    const storedCategoryName = localStorage.getItem('currentCategoryName');
    if (storedCategoryName) {
      this.currentCategoryName = storedCategoryName;
      this.openSubLists[this.currentCategoryName] = true;
    }
  }

  subCategoryName : string = ''
  ngOnInit(): void {
    this.loadCategories();
    this.loadSubCategories();
    this.route.params.subscribe(params => {
      this.subCategoryName = params['subCategoryName'];
      // Load products based on sub-category name
      this.loadProducts(this.subCategoryName);
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadSubCategories(): void {
    this.categoryService.getAllSubCategories().subscribe(subCategories => {
      this.subCategories = subCategories;
    });
  }


  loadProducts(subCategoryName: string): void {
    // Load products based on sub-category name
    this.productService.getProducts(subCategoryName).subscribe(products => {
      this.products = products;
    });
  }


  // loadProducts(subCategoryName: string): void {
  //   this.productService.getProducts(subCategoryName).subscribe(products => {
  //     this.products = products;
  //   });
  // }

  currentCategoryName: string = ''; // Property to hold the name of the currently open category

  toggleSubList(categoryName: string): void {
    this.openSubLists[categoryName] = !this.openSubLists[categoryName];
    this.currentCategoryName = this.openSubLists[categoryName] ? categoryName : '';
    // Store current category name in localStorage
    localStorage.setItem('currentCategoryName', this.currentCategoryName);
  }

  filterSubCategories(categoryId: number): any[] {
    return this.subCategories.filter(sc => sc.categoryId === categoryId);
  }
}
