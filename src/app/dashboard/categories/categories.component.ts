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

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  token: any;

  constructor(
    private router: Router,
    private categoryService: CategoriesService,
    private authService: AuthService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dashboardComponent: DashboardComponent,
    private categoryUpdateService: CategoryUpdateService // Inject CategoryUpdateService
  ) { }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    this.getAllCategories();
  }

  getAllCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (data) => {
        this.categories = data;
        console.log(this.categories);
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }

  deleteCategory(catId: number): void {
    this.categoryService.deleteCategory(catId, this.token).subscribe(
      (data) => {
        this.categories = this.categories.filter(category => category.categoryId !== catId);
        this.dashboardComponent.fetchCategoryCount();
        this.categoryUpdateService.notifyCategoryUpdate();
        console.log(data);
      },
      (error) => {
        console.error('Error deleting category:', error);
      }
    );
  }

  open() {
    const modalRef = this.modalService.open(AddCategoryComponent, { size: 'lg', centered: true });

    modalRef.componentInstance.categoryAdded.subscribe(() => {
      this.getAllCategories(); // Refresh the categories list
      this.dashboardComponent.fetchCategoryCount(); // Update the category count
      this.toastService.add('Category Added successfully');
      this.categoryUpdateService.notifyCategoryUpdate(); // Notify about the category update
    });

    modalRef.result.then(
      (result) => {
        console.log('Modal closed:', result);
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }
}