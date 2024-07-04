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
        CapitalizePipe
    ]
})

export class ProductListComponent implements OnInit {
  currentSubCategoryImage: any;
  openSubLists: { [key: string]: boolean } = {};
  @ViewChild('slider') slider!: ElementRef;
  filters = {
    inStock: true,
    notAvailable: false,
    priceRange: 250
  };

  categories: any[] = [];
  subCategories: any[] = [];
  products: any[] = [];
  categoryTitle: string | null | undefined;
  subCategoryName: string | null | undefined;
  loading: boolean = true;
  currentCategoryName: string = '';
  currentCategoryImage: any;
  
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
    // Subscribe to route params to load sub-categories and products initially
    this.route.paramMap.subscribe(paramMap => {
      this.categoryTitle = paramMap.get('categoryTitle');
      this.subCategoryName = paramMap.get('subCategoryName');
      this.loadSubCategories();
      this.loadProducts(this.subCategoryName);
      this.currentCategoryImage = localStorage.getItem('imgCat'); // Property to hold the image for the current category
      // Set initial page title
      this.updatePageTitle();
      this.loadSubCategories();
    });

    // Simulate loading delay
    setTimeout(() => {
      this.loading = false; // Set loading to false after 2 seconds
    }, 200);
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
  

  loadProducts(subCategoryName: any): void {
    if (subCategoryName) {
      this.productService.getProducts(subCategoryName).subscribe(products => {
        this.products = products;
      });
    } else {
      this.products = [];
    }
  }

  toggleSubList(categoryName: string): void {
    this.openSubLists[categoryName] = !this.openSubLists[categoryName];
    this.currentCategoryName = this.openSubLists[categoryName] ? categoryName : '';
    // Store current category name in localStorage
    localStorage.getItem('imgCat');
  }

  open(product: any) {
    const modalRef = this.modalService.open(ProductModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.product = product;
  }

  selectCategory(event: Event, Category: any): void {
    event.stopPropagation(); // Stop event propagation to prevent dropdown collapse
    this.categoryTitle = Category.categoryTitle;
    this.currentCategoryImage = Category.img || 'default-category-image-url.jpg';
    this.currentCategoryName = this.categories.find(category => category.categoryId)?.categoryTitle || 'Category';
    localStorage.setItem('currentCategoryImage', this.currentCategoryImage);

    // Update page title based on selected subcategory
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
    slider.scrollBy({ left: -955, behavior: 'smooth' }); // Increased scroll amount
  }

  scrollRight(slider: HTMLElement) {
    slider.scrollBy({ left: 955, behavior: 'smooth' }); // Increased scroll amount
  }

}