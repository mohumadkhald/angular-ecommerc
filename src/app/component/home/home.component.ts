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
        this.cartService.syncCartFromLocalStorage();
        this.cartService.clearCart();
  
        // Store the new user flag in localStorage if present
        if (newUser === 'true') {
          localStorage.setItem('newUser', 'true');
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/']);
          localStorage.removeItem('newUser');
        }
      }
    });
  
    // Check and open the password dialog after a 3-second delay
    setTimeout(() => this.checkFirstPwdSet(), 3000);
  }
  
  private checkFirstPwdSet(): void {
    const firstPwdSet = localStorage.getItem('newUser');
    if (firstPwdSet === 'true') {
      localStorage.removeItem('newUser'); // Avoid re-triggering the dialog
      this.openSetFirstPwd();
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
  

  
}
