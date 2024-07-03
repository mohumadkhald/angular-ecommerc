import { NgFor, NgIf } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from "../../service/auth.service";

import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { CategoryService } from '../../service/category.service';
import { UserService } from "../../service/user.service";

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


  goToSearchResult() {
    const categoryTitle = this.selectedCategory || 'all';
    const productName = this.searchText || '';
    this.router.navigate(['categories/search', categoryTitle, productName]);
  }
saveImg(arg0: string) {
  localStorage.setItem("imgCat", arg0)
}
  quantity: any = 0;
  username: string = '';
  img: string = '';
  loading: boolean = true;
  categories: any[] = [];


  constructor(
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private categoryService: CategoryService,
    private cartServerService: CartServerService,
    private cartService: CartService,

  ) {}

  ngOnInit(): void {
    this.userService.username$.subscribe(username => {
      if (username) {
        this.username = username;
        this.loading = false;
        this.cd.detectChanges();  // Trigger change detection if needed
      }
    });
    this.userService.img$.subscribe(img => {
      if (img) {
        this.img = img;
        this.loading = false;
        this.cd.detectChanges();  // Trigger change detection if needed
      }
    });
    
    if (this.auth()) {
      this.userService.loadProfile().subscribe();
      console.log(this.userService.loadProfile().subscribe())
    }
    this.loadCategories();
    this.getCountOfItems()
  }

  logout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout error', error);
      }
    );
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  menuVisible = false;

  toggleMenu(visible: boolean): void {
    this.menuVisible = visible;
  }

  getCountOfItems() {
    if(this.auth())
      {
        return this.cartServerService.getCountOfItems();
      }
    return this.cartService.getCountOfItems();
  }
}
