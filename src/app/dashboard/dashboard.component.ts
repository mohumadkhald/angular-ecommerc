import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { UsersService } from '../dashboard-service/users.service';
import { AuthService } from '../service/auth.service';
import { CategoriesService } from '../dashboard-service/categories.service';
import { ProductsService } from '../dashboard-service/products.service';
import { ExpiredSessionDialogComponent } from '../expired-session-dialog/expired-session-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {


  showStats: boolean = true;
  userCount: number = 0;
  catsCount: number = 0;
  prodsCount: number = 0;
  subCatsCount: any;

  constructor(
      private router: Router,
      private usersService: UsersService,
      private categoriesService: CategoriesService,
      private productService: ProductsService,
      private authService: AuthService,
      private dialog: MatDialog,

    ) {}

  ngOnInit(): void {
    this.showStats = this.router.url === '/dashboard';
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showStats = event.url === '/dashboard';
      }
    });

    this.fetchUserCount();
    this.fetchCategoryCount()
    this.fetchProductCount()
  }

  showExpiredSessionDialog(message: string): void {
    this.dialog.open(ExpiredSessionDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message },
    });
  }
  fetchUserCount() {
    const token = this.authService.getToken();
    this.usersService.getUsers(token, 1, 10).subscribe(users => {
      this.userCount = users.totalElements      ;
      console.log('User count:', this.userCount, users);
    }, error => {
      if (error.status === 403 || error.status === 401) {
        localStorage.removeItem("token");
        this.showExpiredSessionDialog("Your Session Expired");
        setTimeout(() => {
          window.location.reload();
        }, 2000)
      } else {
        console.error('Error loading subcategories:', error);
      }
    });
  }
  fetchCategoryCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.categoriesService.getAllCategories().subscribe(cats => {
      this.catsCount = cats.length;
      console.log('Category count:', this.catsCount);
    }, error => {
      if (error.status === 403 || error.status === 401) {
        localStorage.removeItem("token");
        this.showExpiredSessionDialog("Your Session Expired");
        setTimeout(() => {
          window.location.reload();
        }, 2000)
      } else {
        console.error('Error loading subcategories:', error);
      }
    });
  }

  fetchProductCount() {
    this.productService.getAllProducts(1, 10).subscribe(products => {
      this.prodsCount = products.totalElements;
      console.log('Category count:', products);
    }, error => {
      if (error.status === 403 || error.status === 401) {
        localStorage.removeItem("token");
        this.showExpiredSessionDialog("Your Session Expired");
        setTimeout(() => {
          window.location.reload();
        }, 2000)
      } else {
        console.error('Error loading subcategories:', error);
      }
    });
  }
}
