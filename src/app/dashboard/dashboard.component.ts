import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    NavigationStart,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { ExpiredSessionDialogComponent } from '../component/expired-session-dialog/expired-session-dialog.component';
import { CategoriesService } from '../dashboard-service/categories.service';
import { OrdersService } from '../dashboard-service/orders.service';
import { ProductsService } from '../dashboard-service/products.service';
import { SubCategoriesService } from '../dashboard-service/sub-categories.service';
import { UsersService } from '../dashboard-service/users.service';
import { AuthService } from '../service/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, SidebarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
[x: string]: any;
  showStats: boolean = true;
  userCount: number = 0;
  catsCount: number = 0;
  prodsCount: number = 0;
  subCatsCount: any;
  token!: string | null;
  private authSubscription!: Subscription;
  ordersCount: number = 0;
  totalUsers: any;
  categories: any;
  subCats: any;
  products: any;
  orders: any;

  constructor(
    private router: Router,
    private usersService: UsersService,
    private categoriesService: CategoriesService,
    private SubCategoriesService: SubCategoriesService,
    private productService: ProductsService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cookieService: CookieService,
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        console.log('Auth status changed:', isLoggedIn);
        if (isLoggedIn) {
          this.showStats = this.router.url === '/dashboard';
          this.router.events.subscribe(
            (event) => {
              if (event instanceof NavigationStart) {
                this.showStats = event.url === '/dashboard';
              }
            },
            (error) => {
              if (error.status === 403 || error.status === 401) {
              }
            }
          );

          this.fetchUserCount();
          this.fetchCategoryCount();
          this.fetchSubCategoryCount();
          this.fetchProductCount();
          this.fetchOrdersCount();
        }
      }
    );
  }

  showExpiredSessionDialog(message: string): void {
    this.dialog.open(ExpiredSessionDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message },
    });
  }

  fetchUserCount() {
    this.usersService.getUsers(0, 5).subscribe(
      (users) => {
        this.userCount = users.totalElements;
        this.totalUsers = users.content
        console.log(this.totalUsers)
      },
      (error) => {}
    );
  }
  fetchCategoryCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.categoriesService.getAllCategories().subscribe(
      (cats) => {
        this.catsCount = cats.length;
        this.categories = cats
      },
      (error) => {}
    );
  }

  fetchSubCategoryCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.SubCategoriesService.getAllSubCategories().subscribe(
      (subCats) => {
        this.subCatsCount = subCats.length;
        this.subCats = subCats
      },
      (error) => {}
    );
  }

  fetchProductCount() {
    this.productService.getAllProducts("createdAt", "desc", 0, 999999, [], [], 0, 10, "", "", '').subscribe(
      (products) => {
        this.prodsCount = products.totalElements;
        this.products = products.content;
        console.log(this.products)
      },
      (error) => {}

    );
  }

  fetchOrdersCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.ordersService.getAllOrders().subscribe(
      (orders) => {
        this.ordersCount = orders.length;
        this.orders = orders
      },
      (error) => {}
    );
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }


  showLastElements = true; // Initially hidden

  toggleVisibility() {
    this.showLastElements = !this.showLastElements;
  }
}
