import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { UsersService } from '../dashboard-service/users.service';
import { AuthService } from '../service/auth.service';
import { CategoriesService } from '../dashboard-service/categories.service';


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

  constructor(
      private router: Router,
      private usersService: UsersService,
      private categoriesService: CategoriesService,
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
  }

  fetchUserCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.usersService.getUsers(token).subscribe(users => {
      this.userCount = users.data.length;
      console.log('User count:', this.userCount);
    });
  }
  fetchCategoryCount() {
    const token = this.authService.getToken(); // Assuming you have a method to get the token
    this.categoriesService.getAllCategories().subscribe(cats => {
      this.catsCount = cats.length;
      console.log('Category count:', this.catsCount);
    });
  }
}
