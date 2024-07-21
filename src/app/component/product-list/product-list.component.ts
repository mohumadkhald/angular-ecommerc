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
    PaginationComponent
]
})

export class ProductListComponent implements OnInit {
  currentSubCategoryImage: any;
  openSubLists: { [key: string]: boolean } = {};
  @ViewChild('slider') slider!: ElementRef;
  filters = {
    inStock: true,
    notAvailable: false,
    priceRange: 250,
    minPrice: 0,
    maxPrice: 25000
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
    this.route.paramMap.subscribe(paramMap => {
      this.categoryTitle = paramMap.get('categoryTitle');
      this.subCategoryName = paramMap.get('subCategoryName');
      this.loadSubCategories();
      this.loadProducts(this.subCategoryName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice);
      this.currentCategoryImage = localStorage.getItem('imgCat');
      this.updatePageTitle();
      this.loadSubCategories();
    });

    setTimeout(() => {
      this.loading = false;
    }, 200);
    this.sortedProducts = [...this.products];
  }

  showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message },
    });
  }

  loadSubCategories(): void {
    if (this.categoryTitle) {
      this.categoryService.getSubCategoriesByCategoryTitle(this.categoryTitle).subscribe(
        subCategories => {
          this.subCategories = subCategories;
        },
        error => {
          if (error.status === 403) {
            localStorage.removeItem("token");
          } else {
            console.error('Error loading subcategories:', error);
          }
        }
      );
    }
  }

  loadProducts(subCategoryName: any, sortBy: string = 'createdAt', sortDirection: string = 'desc', minPrice: number = 50, maxPrice: number = 250, page: number = 0, pageSize: number = 5): void {
    if (subCategoryName) {
      this.productService.getProducts(subCategoryName, sortBy, sortDirection, minPrice, maxPrice, page, pageSize)
      .subscribe((response: PaginatedResponse<Product[]>) => {
        this.products = response.content;
        this.currentPage = response.pageable.pageNumber + 1;
        this.totalPages = Array.from({ length: response.totalPages }, (_, i) => i + 1);
      });
    } else {
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
  title: string = this.updatePageTitle();

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

  sortedProducts: Array<{ name: any, price: any }> = [];

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

    this.loadProducts(this.subCategoryName, sortBy, sortDirection, this.filters.minPrice, this.filters.maxPrice);
  }

  onPriceRangeChange(): void {
    this.loadProducts(this.subCategoryName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice);
  }

  onPageChange(page: number): void {
    const categoryName = this.route.snapshot.paramMap.get('categoryTitle') || '';
    const productName = this.route.snapshot.paramMap.get('productName') || '';
    this.loadProducts(this.subCategoryName, 'createdAt', 'desc', this.filters.minPrice, this.filters.maxPrice, page-1);
  }
}
