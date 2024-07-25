import { NgFor, NgIf } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AuthService } from '../../service/auth.service';

import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { CategoryService } from '../../service/category.service';
import { UserService } from '../../service/user.service';
import { ToastService } from '../../service/toast.service';
import { CategoryUpdateService } from '../../dashboard-service/category-update.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf,
    MatProgressSpinner,
    FormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private cartServerService: CartServerService,
    private cartService: CartService,
    public toastService: ToastService,
    private categoryUpdateService: CategoryUpdateService
  ) {
    this.role = 'USER';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.selectedCategory = params['category'] || 'all';
      this.searchText = params['search'] || '';
    });

    this.userService.username$.subscribe((username) => {
      this.username = username || '';
      this.loading = false;
      this.cd.detectChanges();
    });

    this.userService.img$.subscribe((img) => {
      this.img = img || '';
      this.loading = false;
      this.cd.detectChanges();
    });

    this.userService.role$.subscribe((role) => {
      this.role = role;
      this.loading = false;
      this.cd.detectChanges();
    });

    if (this.authService.isLoggedIn()) {
      this.loadProfile();
      this.cartServerService.getCart().subscribe();
      this.getCountOfItems();
    }

    this.loadCategories();
    this.categoryUpdateService.categoryUpdated$.subscribe(() => {
      this.loadCategories(); // Refresh categories when notified
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.clearUserData();
      // setTimeout(() => {
      //   this.router.navigate(['/login']);
      // }, 200);
    });
  }

  private loadProfile(): void {
    this.userService.loadProfile().subscribe({
      error: (err) => {

      }
    });
  }

  private clearUserData(): void {
    this.username = '';
    this.img = '';
    this.role = '';
    this.loading = false;
    this.cd.detectChanges();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (categories) => {
        this.categories = categories;
      },
      (error) => {
      }
    );
  }

  toggleMenu(visible: boolean): void {
    this.menuVisible = visible;
  }

  getCountOfItems() {
    if (this.authService.isLoggedIn()) {
      return this.cartServerService.getCountOfItems();
    }
    return this.cartService.getCountOfItems();
  }

  saveImg(img: string) {
    localStorage.setItem('imgCat', img);
  }

  goToSearchResult() {
    const categoryTitle = this.selectedCategory || 'all';
    const productName = this.searchText || '';
    this.router.navigate(['search'], {
      queryParams: { category: categoryTitle, search: productName },
    });
  }
  auth() {
    return this.authService.isLoggedIn()
  }
}
