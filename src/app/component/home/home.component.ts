import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { NgClass, NgFor,NgIf, NgStyle } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductsService } from '../services/products.service';
import {Product} from "../interface/product";
import {AuthService} from "../../service/auth.service";
import {Router} from "@angular/router";
import {UserService} from "../../user.service";
import {SliderComponent} from "../../slider/slider.component";
@Component({
    standalone: true,
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
  imports: [NgClass, NgStyle, NgFor, NgIf, ProductCardComponent, SliderComponent]
})
export class HomeComponent implements OnInit {
  title = 'Home';
  products!: Product[];
  private username!: string;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private productsService: ProductsService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.auth()) {
      this.userService.loadProfile().subscribe(() => {
        this.userService.username$.subscribe(username => {
          if (username) {
            this.username = username;
            this.cd.detectChanges();
          }
        });
      });
    }
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.userService.clearUsername(); // Clear the username in the shared service
        this.router.navigate(['/user/login']);  // Redirect to login after logout
      },
      error => {
        console.error('Logout error', error);
      }
    );
  }
}
