import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "../../service/auth.service";
import { ToastService } from '../../service/toast.service';
import { UserService } from "../../service/user.service";
import { Product } from "../interface/product";
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductModalComponent } from "../product-modal/product-modal.component";
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
    public toastService: ToastService
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

  showToast() {
    this.toastService.add('This is a toast message.');
  }
  
  removeToast() {
    this.toastService.remove();
  }
  


}