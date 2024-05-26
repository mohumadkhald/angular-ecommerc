import { AfterContentChecked, Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import {AuthService} from "../../service/auth.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink , RouterLinkActive, NgFor, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  quantity: any = 0;

  constructor(private authService: AuthService, private router: Router) {}



  @HostListener('mouseenter') getTotalQuantity(): void {

  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/user/login']); // Assuming you have a login route
  }

  auth() {
    return this.authService.isLoggedIn();
  }



  goToLogin() {
    this.router.navigate(['/user/login']);
  }

  goToRegister() {
    this.router.navigate(['/user/register']);
  }


}
