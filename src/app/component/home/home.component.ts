import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Product } from "../../interface/product";
import { AuthService } from "../../service/auth.service";
import { ToastService } from '../../service/toast.service';
import { UserService } from "../../service/user.service";
import { ProductCardComponent } from '../product-card/product-card.component';
import { SetFirstPasswordComponent } from '../set-first-password/set-first-password.component';
@Component({
    standalone: true,
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
  imports: [NgClass, NgStyle, NgFor, NgIf, ProductCardComponent]
})

export class HomeComponent implements OnInit {
  title = 'Home';
  products!: Product[];
  private username!: string;
  private modalRef?: NgbModalRef;
  private closeTimeoutId?: number;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private renderer: Renderer2
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
    
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const message = params['message'];
      const role = params['role'];
      if (token) {
        this.authService.saveToken(token);
        if (params['newUser'] === 'true') {
          this.openSetFirstPwd();
        } else {
          this.router.navigate(['/']);
        }
      }
    });

    // Check if the user needs to set the first password
    const firstPwdSet = localStorage.getItem('firstPwdSet');
    if (firstPwdSet == "false") {
      this.openSetFirstPwd();
    }
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout().subscribe(
      response => {
        this.userService.clearUsername(); // Clear the username in the shared service
        this.router.navigate(['/user/login']);  // Redirect to login after logout
      },
      error => {
      }
    );
  }


  openSetFirstPwd(): void {
    const dialogRef = this.dialog.open(SetFirstPasswordComponent, {
      width: '500px',
      height: '400px',
      data: { name: 'Set Password For Email Address' },
      panelClass: 'custom-dialog-container'  // Apply the custom class here
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector('.cdk-overlay-pane') as HTMLElement;

      // Hide the dialog initially
      dialogContainer.style.display = 'none';

      // Apply new styles to the dialog container
      this.renderer.setStyle(dialogContainer, 'position', 'relative');
      this.renderer.setStyle(dialogContainer, 'top', '0px');
      this.renderer.setStyle(dialogContainer, 'z-index', '100');

      // Show the dialog after applying styles
      dialogContainer.style.display = 'block';
    });

    dialogRef.afterClosed().subscribe(() => {
      // Set flag to indicate that the password has been set
      localStorage.setItem('firstPwdSet', 'true');
    });
  }

}