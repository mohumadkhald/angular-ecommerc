import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  // CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
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
import { Subscription } from 'rxjs';
import { CategoryUpdateService } from '../../dashboard-service/category-update.service';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../service/toast.service';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatProgressSpinner,
    FormsModule,
    CommonModule,
    CapitalizePipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchContainer', { static: false })
  searchContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('usernameContainer', { static: false })
  usernameContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('categorySelect') selectElement!: ElementRef<HTMLSelectElement>;

  selectedCategory: string = 'all';
  searchText: string = '';
  quantity: any = 0;
  username: string = '';
  img: string = '';
  role: string = '';
  loading: boolean = true;
  categories: any[] = [];
  menuVisible = false;
  private authSubscription!: Subscription;

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
    private renderer: Renderer2,
    private categoryUpdateService: CategoryUpdateService
  ) {
    this.role = 'USER';
  }

  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   this.selectedCategory = params['category'] || 'all';
    //   this.searchText = params['search'] || '';
    // });
    // this.loadCategories();
    this.categoryUpdateService.categoryUpdated$.subscribe(() => {
      this.loadCategories();
    });

    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          this.loadUserProfile();
          this.cartServerService.getCart().subscribe();
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
            this.authService.saveRole(role);
            this.cd.detectChanges();
          });
        }
      }
    );
    this.updatePagedCategories();
    this.setVisibleCount(window.innerWidth);
  }

  ngAfterViewInit(): void {
    this.adjustSelectWidth(); // Adjust initially

    // Listen for changes to adjust the width whenever an option is selected
    this.selectElement.nativeElement.addEventListener('change', () => {
      this.adjustSelectWidth();
    });
    this.renderer.listen(
      this.searchContainer.nativeElement,
      'mousedown',
      () => {
        this.renderer.addClass(this.searchContainer.nativeElement, 'focused');
      }
    );

    this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
      if (!this.searchContainer.nativeElement.contains(event.target as Node)) {
        this.renderer.removeClass(
          this.searchContainer.nativeElement,
          'focused'
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout().subscribe((response) => {
      if (response.status === 200) {
        this.clearUserData();
        this.router.navigate(['/auth'], { queryParams: { state: 'login' } });
      }
    });
  }

  private loadUserProfile(): void {
    this.userService.loadProfile().subscribe(() => {
      this.userService.username$.subscribe((username) => {
        if (username) {
          this.username = username;
          this.cd.detectChanges();
        }
      });
      this.userService.role$.subscribe((role) => {
        if (role) {
          this.role = role;
          this.authService.saveRole(role);
          this.cd.detectChanges();
        }
      });
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
        this.updatePagedCategories(); // Adjust paged categories after categories are loaded
        this.adjustSelectWidth(); // Adjust width after categories are loaded
      },
      (error) => {}
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
    if (productName != '') {
      this.router.navigate(['search'], {
        queryParams: {
          category: categoryTitle,
          search: productName,
          page: 1,
          inStock: true,
          notAvailable: true,
        },
      });
    }
  }

  auth() {
    return this.authService.isLoggedIn();
  }

  adjustSelectWidth() {
    const selectElement = this.selectElement.nativeElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    if (!selectedOption) return;

    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';

    const styles = window.getComputedStyle(selectElement);
    tempSpan.style.fontSize = styles.fontSize;
    tempSpan.style.fontFamily = styles.fontFamily;
    tempSpan.style.fontWeight = styles.fontWeight;

    tempSpan.innerText = selectedOption.text;

    document.body.appendChild(tempSpan);
    const width = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);

    selectElement.style.width = `${width + 40}px`;
  }

  currentPage = 0;
  visibleCount = 5;
  pagedCategories: any[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setVisibleCount(event.target.innerWidth);
  }

  setVisibleCount(width: number) {
    if (width >= 600) {
      this.visibleCount = 6;
    } else if (width >= 500) {
      this.visibleCount = 5;
    } else if (width >= 300) {
      this.visibleCount = 4;
    } else if (width >= 250) {
      this.visibleCount = 3;
    } else {
      this.visibleCount = 1;
    }
  }

  get totalPages() {
    return Math.ceil(this.categories.length / this.visibleCount);
  }

  updatePagedCategories() {
    const start = this.currentPage * this.visibleCount;
    const end = start + this.visibleCount;
    this.pagedCategories = this.categories.slice(start, end);
  }

  nextCategories() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePagedCategories();
    }
  }

  prevCategories() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagedCategories();
    }
  }
}
