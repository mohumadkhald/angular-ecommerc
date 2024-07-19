import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "../../service/auth.service";
import { ToastService } from '../../service/toast.service';
import { UserService } from "../../service/user.service";
import { Product } from "../interface/product";
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductModalComponent } from "../product-modal/product-modal.component";
import { SetFirstPasswordComponent } from '../../set-first-password/set-first-password.component';
import { MatDialog } from '@angular/material/dialog';
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
        console.log('Logout successful', response);
        this.userService.clearUsername(); // Clear the username in the shared service
        this.router.navigate(['/user/login']);  // Redirect to login after logout
      },
      error => {
        console.error('Logout error', error);
      }
    );
  }

  product = {
    title: 'Cool Green Dress with Red Bell',
    mainImage: 'assets/pages/img/careers/careers.jpg', // Ensure this is the correct path to your image
    description: 'Lorem ipsum dolor sit amet...',
    price: '$47.00',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Red', 'Green', 'Blue', 'Yellow']
  };

  open() {
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
      this.closeTimeoutId = undefined;
    }
    if (!this.modalRef) {
      this.modalRef = this.modalService.open(ProductModalComponent, { size: 'lg' });
      this.modalRef.componentInstance.product = this.product;
      // Listen to the mouseleave event on the modal content
      this.modalRef.result.finally(() => this.modalRef = undefined);
      const modalElement = document.querySelector('.modal-content');
      if (modalElement) {
        modalElement.addEventListener('mouseleave', () => this.close());
      }
    }
  }

  close() {
    this.closeTimeoutId = window.setTimeout(() => {
      if (this.modalRef) {
        this.modalRef.close();
        this.modalRef = undefined;
      }
    }, 3000); // Adjust the delay as needed
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

  showToast() {
    this.toastService.add('This is a toast message.');
  }
  
  removeToast() {
    this.toastService.remove();
  }
}