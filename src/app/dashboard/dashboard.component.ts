import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ExpiredSessionDialogComponent } from '../component/expired-session-dialog/expired-session-dialog.component';
import { CategoriesService } from '../dashboard-service/categories.service';
import { ProductsService } from '../dashboard-service/products.service';
import { UsersService } from '../dashboard-service/users.service';
import { AuthService } from '../service/auth.service';
import { SidebarComponent } from "./sidebar/sidebar.component";
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {


  showStats: boolean = true;
  userCount: number = 0;
  catsCount: number = 0;
  prodsCount: number = 0;
  subCatsCount: any;
  token!: string | null

  constructor(
      private router: Router,
      private usersService: UsersService,
      private categoriesService: CategoriesService,
      private productService: ProductsService,
      private authService: AuthService,
      private dialog: MatDialog,
      private cookieService: CookieService,

    ) {}

  ngOnInit(): void {
    this.showStats = this.router.url === '/dashboard';
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showStats = event.url === '/dashboard';
      }
    }, (error) => {
      if (error.status === 403 || error.status === 401) {

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
    this.usersService.getUsers(0, 10).subscribe(users => {
      this.userCount = users.totalElements;
      console.log(users)
    }, error => {

    });
  }
  fetchCategoryCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.categoriesService.getAllCategories().subscribe(cats => {
      this.catsCount = cats.length;
    }, error => {

    });
  }

  fetchProductCount() {
    this.productService.getAllProducts(0, 10).subscribe(products => {
      this.prodsCount = products.totalElements;
    }, error => {

    });
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }
}
