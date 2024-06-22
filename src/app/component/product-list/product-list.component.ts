import {Component, OnInit} from '@angular/core';
import {CurrencyPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ProductCardComponent} from "../product-card/product-card.component";

import {SidebarComponent} from "../sidebar/sidebar.component";
import {FormsModule} from "@angular/forms";
import {CategoryService} from "../../service/category.service";
import {ProductsService} from "../../service/products.service";
import {Product} from "../interface/product";
import {ActivatedRoute, RouterLink, RouterLinkActive} from "@angular/router";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductModalComponent } from '../product-modal/product-modal.component';

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
    RouterLinkActive,
    MatProgressSpinner
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

  constructor(
      private categoryService: CategoryService,
      private productService: ProductsService,
      private route : ActivatedRoute,
      private modalService: NgbModal
    ) {
    const storedCategoryName = localStorage.getItem('currentCategoryName');
    if (storedCategoryName) {
      this.currentCategoryName = storedCategoryName;
      this.openSubLists[this.currentCategoryName] = true;
    }
  }

  subCategoryName : string = ''
  loading: boolean = true;

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubCategories();
    this.route.params.subscribe(params => {
      this.subCategoryName = params['subCategoryName'];
      // Load products based on sub-category name
      this.loadProducts(this.subCategoryName);
    });

    // Simulate loading for 2 seconds
    setTimeout(() => {
      this.loading = false; // Set loading to false after 2 seconds
    }, 200);
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


  open(product: any) {
    const modalRef = this.modalService.open(ProductModalComponent, { size: 'lg' });
    modalRef.componentInstance.product = product;
  }
  
}
