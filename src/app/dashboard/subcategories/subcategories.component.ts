import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoriesService } from '../../dashboard-service/categories.service';
import { CategoryUpdateService } from '../../dashboard-service/category-update.service';
import { AuthService } from '../../service/auth.service';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../service/toast.service';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { DashboardComponent } from '../dashboard.component';
import { CommonModule } from '@angular/common';
import { SubCategoriesService } from '../../dashboard-service/sub-categories.service';
import { AddSubCategoryComponent } from '../add-sub-category/add-sub-category.component';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.css',
})
export class SubcategoriesComponent {
  subCategories: any[] = [];
  token: any;
  subCategoryCounts: { [key: string]: number } = {};
   /* -------- Pagination -------- */
  currentPage = 1;
  pageSize = 6; // rows per page
  totalPages = 0;

  constructor(
    private router: Router,
    private subCategoryService: SubCategoriesService,
    private authService: AuthService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dashboardComponent: DashboardComponent,
    private catService: CategoryService
  ) {}

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.getAllCategories();
  }

  getAllCategories(): void {
    this.subCategoryService.getAllSubCategories().subscribe(data => {
      this.subCategories = data;
      this.totalPages = Math.ceil(this.subCategories.length / this.pageSize);
      this.currentPage = 1;
    });
  }


  deleteCategory(catId: number): void {
    if (confirm('Are you sure you want to delete this SubCategory?')) {
      this.subCategoryService.deleteSubCategory(catId).subscribe(
        (data) => {
          this.subCategories = this.subCategories.filter(
            (category) => category.id !== catId
          );
          // this.dashboardComponent.fetchCategoryCount();
        },
        (error) => {}
      );
    }
  }

  open() {
    const modalRef = this.modalService.open(AddSubCategoryComponent, {
      size: 'lg',
      centered: true,
    });

    modalRef.componentInstance.categoryAdded.subscribe(() => {
      this.getAllCategories(); // Refresh the categories list
      // this.dashboardComponent.fetchCategoryCount(); // Update the category count
      this.toastService.add('Category Added successfully', 'success');
    });

    modalRef.result.then(
      (result) => {},
      (reason) => {}
    );
  }
  update(category: any) {
    const modalRef = this.modalService.open(AddSubCategoryComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.subCat = category;
    modalRef.result;

    modalRef.componentInstance.categoryAdded.subscribe(() => {
      this.getAllCategories(); // Refresh the categories list
      // this.dashboardComponent.fetchCategoryCount(); // Update the category count
      this.toastService.add('Category Updated successfully', 'success');
    });

    modalRef.result.then(
      (result) => {},
      (reason) => {}
    );
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
      this.subCategoryService
        .changePhoto(category.name, file, category.img)
        .subscribe(
          (response) => {
            this.toastService.add(
              'Category Image Updated Successfully',
              'success'
            );
            this.subCategoryService.getAllSubCategories().subscribe((updated) => {
              this.subCategories = updated;
            }); // Refresh category cache
          },
          (error) => {
            this.toastService.add('Failed to update Category Image', 'error');
          }
        );
    }
  

  /* -------- Pagination Helpers -------- */
  get paginatedSubCategories(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.subCategories.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }


  auth(): boolean {
    return this.authService.isLoggedIn();
  }
}
