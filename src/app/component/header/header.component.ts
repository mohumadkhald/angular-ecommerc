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
import {
  defer,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from 'rxjs';
import { CategoryUpdateService } from '../../dashboard-service/category-update.service';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../service/toast.service';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';

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
  quantity: number = 0;
  username: string = '';
  img: string = '';
  role: string = 'USER';
  loading: boolean = true;
  categories: any[] = [];
  menuVisible = false;

  private destroy$ = new Subject<void>();

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
    private categoryUpdateService: CategoryUpdateService,
  ) {}
  count$!: Observable<number>;

  // =============================
  // LIFECYCLE
  // =============================

  ngOnInit(): void {
    this.subscribeToCategoryUpdates();
    this.subscribeToUserState();
    this.loadCategories();
    this.count$ = this.getCountOfItems();
  }

  ngAfterViewInit(): void {
    this.initSearchFocus();
    this.initSelectWidth();
    this.getCountOfItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================
  // SUBSCRIPTIONS
  // =============================

  private subscribeToUserState(): void {
    // Load profile ONCE per login
    this.authService.isLoggedIn$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        filter(Boolean),
        switchMap(() => this.userService.loadProfile()),
      )
      .subscribe();

    // Username
    this.userService.username$
      .pipe(takeUntil(this.destroy$))
      .subscribe((username) => {
        this.username = username ?? '';
        this.loading = false;
        this.cd.markForCheck();
      });

    // Image
    this.userService.img$.pipe(takeUntil(this.destroy$)).subscribe((img) => {
      this.img = img ?? '';
    });

    // Role
    this.userService.role$.pipe(takeUntil(this.destroy$)).subscribe((role) => {
      if (role) {
        this.role = role;
        this.authService.saveRole(role);
      }
    });
  }

  private subscribeToCategoryUpdates(): void {
    this.categoryUpdateService.categoryUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadCategories());
  }

  // =============================
  // UI HELPERS
  // =============================

  private initSearchFocus(): void {
    this.renderer.listen(this.searchContainer.nativeElement, 'mousedown', () =>
      this.renderer.addClass(this.searchContainer.nativeElement, 'focused'),
    );

    this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
      if (!this.searchContainer.nativeElement.contains(event.target as Node)) {
        this.renderer.removeClass(
          this.searchContainer.nativeElement,
          'focused',
        );
      }
    });
  }

  private initSelectWidth(): void {
    this.selectElement.nativeElement.addEventListener('change', () =>
      this.adjustSelectWidth(),
    );
  }

  adjustSelectWidth(): void {
    const select = this.selectElement.nativeElement;
    const option = select.options[select.selectedIndex];
    if (!option) return;

    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';

    const styles = window.getComputedStyle(select);
    span.style.fontSize = styles.fontSize;
    span.style.fontFamily = styles.fontFamily;
    span.style.fontWeight = styles.fontWeight;
    span.innerText = option.text;

    document.body.appendChild(span);
    select.style.width = `${span.offsetWidth + 40}px`;
    document.body.removeChild(span);
  }

  // =============================
  // DATA
  // =============================

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  // =============================
  // ACTIONS
  // =============================

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.userService.clear();
      this.router.navigate(['/auth'], {
        queryParams: { state: 'login' },
      });
    });
  }

  getCountOfItems(): Observable<number> {
    if (this.authService.isLoggedIn()) {
      return this.cartServerService.getCart().pipe(
        switchMap(() => this.cartServerService.getCountOfItems()),
        map((c) => c ?? 0),
      );
    }

    // LOCAL CART
    this.cartService.getCart(); // ensure cart is loaded
    return this.cartService.count$;
  }
  goToSearchResult(): void {
    if (!this.searchText) return;

    this.router.navigate(['search'], {
      queryParams: {
        category: this.selectedCategory,
        search: this.searchText,
        page: 1,
        inStock: true,
        notAvailable: true,
      },
    });
  }

  toggleMenu(visible: boolean): void {
    this.menuVisible = visible;
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }
}
