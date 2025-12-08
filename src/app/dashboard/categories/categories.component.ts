import { Component, OnInit } from '@angular/core';
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
    this.categoryService.getAllCategories().subscribe(
      (categoriesData) => {
        this.categories = categoriesData;
        this.loadSubCategories(); // Fetch subcategories after categories are loaded
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }

  loadSubCategories(): void {
    const categoryTitles = this.categories.map(
      (category) => category.categoryTitle
    );

    // Use a promise to handle sequential API calls
    const promises = categoryTitles.map((title) =>
      this.catService.getSubCategoriesByCategoryTitle(title).toPromise()
    );

    // Process each promise sequentially
    Promise.all(promises)
      .then((results) => {
        results.forEach((subCategories, index) => {
          const title = categoryTitles[index];
          this.subCategoryCounts[title] = subCategories.length;
        });
      })
      .catch((error) => {});
  }

  deleteCategory(catId: number): void {
    if (confirm('Are you sure you want to delete this Category?')) {
      this.categoryService.deleteCategory(catId).subscribe(
        (data) => {
          this.categories = this.categories.filter(
            (category) => category.categoryId !== catId
          );
          this.dashboardComponent.fetchCategoryCount();
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
      this.dashboardComponent.fetchCategoryCount();
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
      this.dashboardComponent.fetchCategoryCount(); // Update the category count
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
}
