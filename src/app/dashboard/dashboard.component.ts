import { CommonModule, NgIf } from '@angular/common';
import { Component, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { map, Observable, Subscription, tap } from 'rxjs';
import { ExpiredSessionDialogComponent } from '../component/expired-session-dialog/expired-session-dialog.component';
import { CategoriesService } from '../dashboard-service/categories.service';
import { OrdersService } from '../dashboard-service/orders.service';
import { ProductsService } from '../dashboard-service/products.service';
import { SubCategoriesService } from '../dashboard-service/sub-categories.service';
import { UsersService } from '../dashboard-service/users.service';
import { AuthService } from '../service/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, fas } from '@fortawesome/free-solid-svg-icons';
import { Counts, DashboardService } from '../dashboard-service/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FontAwesomeModule,
    RouterOutlet,
    RouterLink,
    NgIf,
    SidebarComponent,
    CommonModule,
    RouterModule
  ],
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
    library: FaIconLibrary,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private dashboardService: DashboardService,
  ) {
    library.addIcons(faEye, faEyeSlash);
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          this.showStats = this.router.url === '/dashboard';

          this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
              // Show stats only on /dashboard or root
              this.showStats =
                event.urlAfterRedirects === '/dashboard' ||
                event.urlAfterRedirects === '/';
            }
          });
          this.dashboardService.loadCounts();

          // this.fetchUserCount();
          // this.usersService.getUsersCount().subscribe((count) => {
          //   this.userCount = count;
          // });

          this.dashboardService.counts$.subscribe((counts: Counts) => {
            this.userCount = counts.users;
            this.subCatsCount = counts.subCategories;
            this.prodsCount = counts.products;
            this.catsCount = counts.categories;
            this.ordersCount = counts.orders;
          });
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


  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  showLastElements = false; // Initially hidden
  showLastUsers = true; // Initially hidden
  showLastCats = true; // Initially hidden
  showLastSubCats = true; // Initially hidden
  showLastProducts = true; // Initially hidden
  showLastOrders = true; // Initially hidden

  toggleVisibility() {
    this.showLastElements = !this.showLastElements;
  }

  toggle(which: string) {
    if (which == 'all') {
      this.showLastElements = !this.showLastElements;
    } else if (which == 'user') {
      this.showLastUsers = !this.showLastUsers;
    } else if (which == 'cat') {
      this.showLastCats = !this.showLastCats;
    } else if (which == 'sub') {
      this.showLastSubCats = !this.showLastSubCats;
    } else if (which == 'product') {
      this.showLastProducts = !this.showLastProducts;
    } else if (which == 'order') {
      this.showLastOrders = !this.showLastOrders;
    }
  }
}
