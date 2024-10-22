import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../interface/product';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { UserService } from '../../service/user.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SetFirstPasswordComponent } from '../set-first-password/set-first-password.component';
import { Subscription } from 'rxjs';
import { CartService } from '../../service/cart.service';
@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [NgClass, NgStyle, NgFor, NgIf, ProductCardComponent],
})
export class HomeComponent implements OnInit {
  title = 'Home';
  products!: Product[];
  private username!: string;
  private modalRef?: NgbModalRef;
  private closeTimeoutId?: number;
  private authSubscription!: Subscription;
  ps: any;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const role = params['role'];
      const newUser = params['newUser'];
      if (token) {
        this.authService.saveToken(token);
        this.authService.saveRole(role);
        // Store the new user flag in cookies if present
        if (newUser === 'true') {
          this.setCookie('newUser', 'true', 1); // Expires in 1 day
          this.router.navigate(['/']);
          this.toastService.add("You Are Register to WebSite")

        } else {
          this.router.navigate(['/']);
          this.deleteCookie('newUser');
          this.toastService.add("Welcome Back to WebSite")
        }
      }
      if(this.cartService.getCart().length > 0)
      {
        this.cartService.syncCartFromLocalStorage();
        this.cartService.clearCart();
      }
    });

    // Check and open the password dialog after a 3-second delay
    setTimeout(() => this.checkFirstPwdSet(), 3000);
  }

  private checkFirstPwdSet(): void {
    const firstPwdSet = this.getCookie('newUser');
    if (firstPwdSet === 'true') {
      this.deleteCookie('newUser'); // Avoid re-triggering the dialog
      // this.openSetFirstPwd();
    }
  }

  openSetFirstPwd(): void {
    const dialogRef = this.dialog.open(SetFirstPasswordComponent, {
      width: '500px',
      height: '400px',
      data: { name: 'Set Password For Email Address' },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector('.cdk-overlay-pane') as HTMLElement;

      // Hide dialog initially and apply custom styles
      dialogContainer.style.display = 'none';
      this.renderer.setStyle(dialogContainer, 'position', 'relative');
      this.renderer.setStyle(dialogContainer, 'top', '0px');
      this.renderer.setStyle(dialogContainer, 'z-index', '100');
      dialogContainer.style.display = 'block'; // Show after styling
    });

    dialogRef.afterClosed().subscribe(() => {
      // window.location.reload()
    });
  }

  // Utility function to set cookies
  private setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  }

  // Utility function to get cookies
  private getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      let c = cookie.trim();
      if (c.startsWith(nameEQ)) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  }

  // Utility function to delete cookies
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
