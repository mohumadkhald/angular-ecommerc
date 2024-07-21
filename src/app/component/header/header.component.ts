import { NgFor, NgIf } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from "../../service/auth.service";

import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { CategoryService } from '../../service/category.service';
import { UserService } from "../../service/user.service";
import { ToastService } from '../../service/toast.service';
import { CategoryUpdateService } from '../../dashboard-service/category-update.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, MatProgressSpinner, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class HeaderComponent implements OnInit {
  selectedCategory: string = 'all';
  searchText: string = '';
  quantity: any = 0;
  username: string = '';
  img: string = '';
  role: string = '';
  loading: boolean = true;
  categories: any[] = [];
  menuVisible = false;

  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private categoryService: CategoryService,
    private cartServerService: CartServerService,
    private cartService: CartService,
    public toastService: ToastService,
    private categoryUpdateService: CategoryUpdateService, // Inject CategoryUpdateService
    private route: ActivatedRoute
  ) {
    this.role = 'USER';
  }

  ngOnInit(): void {
    this.userService.username$.subscribe(username => {
      if (username) {
        this.username = username;
        this.loading = false;
        this.cd.detectChanges();
      }
    });
    this.userService.img$.subscribe(img => {
      if (img) {
        this.img = img;
        this.loading = false;
        this.cd.detectChanges();
      }
    });
    this.userService.role$.subscribe(role => {
      if (role) {
        this.role = role;
        localStorage.setItem('role', this.role);
        this.loading = false;
        this.cd.detectChanges();
      }
    });

    if (this.auth()) {
      this.cartServerService.getCart().subscribe();
      this.getCountOfItems();
      this.userService.loadProfile().subscribe();
    }
    this.loadCategories();
    this.categoryUpdateService.categoryUpdated$.subscribe(() => {
      this.loadCategories(); // Refresh categories when notified
    });

    // Retrieve search parameters from the URI
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || 'all';
      this.searchText = params['search'] || '';
    });
  }

  logout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout error', error);
        localStorage.removeItem("token");
      }
    );
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    }, error => {
      if (error.status === 403) {
        localStorage.removeItem("token");
        setTimeout(() => {
          this.router.navigate([`/login`]);
        }, 3000);
      }
    });
  }

  toggleMenu(visible: boolean): void {
    this.menuVisible = visible;
  }

  getCountOfItems() {
    if (this.auth()) {
      return this.cartServerService.getCountOfItems();
    }
    return this.cartService.getCountOfItems();
  }

  saveImg(img: string) {
    localStorage.setItem("imgCat", img);
  }

  goToSearchResult() {
    const categoryTitle = this.selectedCategory || 'all';
    const productName = this.searchText || '';
    this.router.navigate(['categories/search', categoryTitle, productName], {
      queryParams: { category: categoryTitle, search: productName }
    });
  }
}