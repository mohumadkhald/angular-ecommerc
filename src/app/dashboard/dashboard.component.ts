import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { UsersService } from '../dashboard-service/users.service';
import { AuthService } from '../service/auth.service';
import { CategoriesService } from '../dashboard-service/categories.service';
import { ProductsService } from '../dashboard-service/products.service';


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
      private authService: AuthService
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

  fetchUserCount() {
    const token = this.authService.getToken();
    this.usersService.getUsers(token, 1, 10).subscribe(users => {
      this.userCount = users.totalElements      ;
      console.log('User count:', this.userCount, users);
    });
  }
  fetchCategoryCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.categoriesService.getAllCategories().subscribe(cats => {
      this.catsCount = cats.length;
      console.log('Category count:', this.catsCount);
    });
  }

  fetchProductCount() {
    this.productService.getAllProducts(1, 10).subscribe(products => {
      this.prodsCount = products.totalElements;
      console.log('Category count:', products);
    });
  }
}
