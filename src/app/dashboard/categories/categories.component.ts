import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CategoriesService } from '../../dashboard-service/categories.service';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../service/toast.service';
import { DashboardComponent } from '../dashboard.component';
import { CommonModule } from '@angular/common';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { CategoryUpdateService } from '../../dashboard-service/category-update.service';
import { ProductListComponent } from '../../component/product-list/product-list.component';
import { CategoryService } from '../../service/category.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  token: any;
  subCategoryCounts: { [key: string]: number } = {};
  /* -------- Pagination -------- */
  currentPage = 1;
  pageSize = 5; // rows per page
  totalPages = 0;

  constructor(
    private router: Router,
    private categoryService: CategoriesService,
    private authService: AuthService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dashboardComponent: DashboardComponent,
    private catService: CategoryService,
    private categoryUpdateService: CategoryUpdateService
  ) {}

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.getAllCategories();
  }

  getAllCategories(): void {
    this.categoryService.getAllCategories().subscribe((data) => {
      this.categories = data;
      this.totalPages = Math.ceil(this.categories.length / this.pageSize);
      this.currentPage = 1;
    });
  }

  deleteCategory(catId: number): void {
    if (confirm('Are you sure you want to delete this Category?')) {
      this.categoryService.deleteCategory(catId).subscribe(
        (data) => {
          this.categories = this.categories.filter(
            (category) => category.categoryId !== catId
          );
          this.categoryUpdateService.notifyCategoryUpdate();
        },
        (error) => {}
      );
    }
  }

  open() {
    const modalRef = this.modalService.open(AddCategoryComponent, {
      size: 'lg',
      centered: true,
    });

    modalRef.componentInstance.categoryAdded.subscribe(() => {
      this.toastService.add('Category Added successfully', 'success');
      // Emit update event once
      this.categoryUpdateService.notifyCategoryUpdate();
      this.categoryService.refreshCategories().subscribe((updated) => {
        this.categories = updated;
      }); // Refresh category cache
    });

    modalRef.result.then(
      (result) => {},
      (reason) => {}
    );
  }

  update(cat: number) {
    const modalRef = this.modalService.open(AddCategoryComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.cat = cat;
    modalRef.result;
    modalRef.componentInstance.categoryAdded.subscribe(() => {
      this.getAllCategories(); // Refresh the categories list
      this.toastService.add('Category Updated successfully', 'success');
      this.categoryUpdateService.notifyCategoryUpdate(); // Notify about the category update
      this.categoryService.refreshCategories().subscribe((updated) => {
        this.categories = updated;
      }); // Refresh category cache
    });

    modalRef.result.then(
      (result) => {},
      (reason) => {}
    );
  }

  getCountOfSubCats(categoryTitle: string): number {
    return this.subCategoryCounts[categoryTitle] || 0;
  }
  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  showChangeImageButton = false;
  currentCat = '';

  @ViewChild('fileInput')
  fileInput!: ElementRef;
  triggerFileInput(c: any) {
    this.fileInput.nativeElement.click();
    this.currentCat = c;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.uploadImage(file, this.currentCat);
    }
  }
  uploadImage(file: File, category: any) {
    this.categoryService
      .changePhoto(category.categoryTitle, file, category.img)
      .subscribe(
        (response) => {
          this.toastService.add(
            'Category Image Updated Successfully',
            'success'
          );
          this.categoryService.refreshCategories().subscribe((updated) => {
            this.categories = updated;
          }); // Refresh category cache
        },
        (error) => {
          this.toastService.add('Failed to update Category Image', 'error');
        }
      );
  }

  /* -------- Pagination Helpers -------- */
  get paginatedCategories(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.categories.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}