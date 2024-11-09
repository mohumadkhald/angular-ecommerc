import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
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
  imports: [
    NgClass,
    NgStyle,
    NgFor,
    NgIf,
    ProductCardComponent,
    RouterLink,
    RouterLinkActive,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
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
          this.toastService.add('You Are Register to WebSite');
        } else {
          this.router.navigate(['/']);
          this.deleteCookie('newUser');
          this.toastService.add('Welcome Back to WebSite');
        }
      }
      if (this.cartService.getCart().length > 0) {
        this.cartService.syncCartFromLocalStorage();
        this.cartService.clearCart();
      }
    });

    // Check and open the password dialog after a 3-second delay
    setTimeout(() => this.checkFirstPwdSet(), 3000);

    // Start auto-sliding the images every 2 seconds
    this.autoSlideInterval = setInterval(() => {
      this.nextImage();
    }, 2000);
  }

  private checkFirstPwdSet(): void {
    const firstPwdSet = this.getCookie('newUser');
    if (firstPwdSet === 'true') {
      this.deleteCookie('newUser'); // Avoid re-triggering the dialog
      // this.openSetFirstPwd();
    }
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }
  openSetFirstPwd(): void {
    const dialogRef = this.dialog.open(SetFirstPasswordComponent, {
      width: '500px',
      height: '400px',
      data: { name: 'Set Password For Email Address' },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector(
        '.cdk-overlay-pane'
      ) as HTMLElement;

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

  images = [
    '../../../assets/amz/bigImg1.jpg',
    '../../../assets/amz/bigImg2.jpg',
    '../../../assets/amz/bigImg.jpg',
    '../../../assets/amz/bigImg00.jpg',
    '../../../assets/amz/bigImg000.jpg',
    '../../../assets/amz/bigImg0.jpg',
    '../../../assets/amz/bigImg3.jpg',
    '../../../assets/amz/bigImg4.jpg',
  ];

  currentImageIndex = 0;
  autoSlideInterval: any;

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed to prevent memory leaks
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  prevImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  blockbusterDeals = [
    {
      discount: 'Up to 24% off',
      event: 'Great Freedom Sale',
      product: 'Samsung Galaxy M34',
      image: '../../../assets/amz/boxb101.jpg',
    },
    {
      discount: 'Up to 45% off',
      event: 'Great Freedom Sale',
      product: 'Redmi 12C | Starting from 7699 incl...',
      image: '../../../assets/amz/boxb102.jpg',
    },
    {
      discount: 'Up to 76% off',
      event: 'Great Freedom Sale',
      product: 'Top headsets from Oneplus, Samsung...',
      image: '../../../assets/amz/boxb103.jpg',
    },
    {
      discount: 'Up to 38% off',
      event: 'Great Freedom Sale',
      product: 'Daily Essentials',
      image: '../../../assets/amz/boxb104.jpg',
    },
    {
      discount: 'Up to 43% off',
      event: 'Great Freedom Sale',
      product: 'Skin - Biotique, Cetaphil, Himalaya...',
      image: '../../../assets/amz/boxb105.jpg',
    },
    {
      discount: 'Up to 55% off',
      event: 'Great Freedom Sale',
      product: 'JBL Audio Freedom Sale Deals...',
      image: '../../../assets/amz/boxb106.jpg',
    },
    {
      discount: 'Deal of the Day',
      event: 'Great Freedom Sale',
      product: 'OnePlus Nord CE 3 5G | Latest launch...',
      image: '../../../assets/amz/boxb107.jpg',
    },
    {
      discount: 'Up to 58% off',
      event: 'Great Freedom Sale',
      product: 'Alexa Devices - Echo and Fire TV..',
      image: '../../../assets/amz/boxb108.jpg',
    },
    {
      discount: 'Up to 63% off',
      event: 'Great Freedom Sale',
      product: 'Best Styles in Footwear and Handbags...',
      image: '../../../assets/amz/boxb109.jpg',
    },
    {
      discount: 'Up to 60% off',
      event: 'Great Freedom Sale',
      product: 'Top Offers on Mice & Keyboards',
      image: '../../../assets/amz/boxb110.jpg',
    },
    {
      discount: 'Up to 76% off',
      event: 'Great Freedom Sale',
      product: 'Best Selling Massagers',
      image: '../../../assets/amz/boxb111.jpg',
    },
    {
      discount: 'Up to 61% off',
      event: 'Great Freedom Sale',
      product: 'Lowest Ever Price on PS5 Console',
      image: '../../../assets/amz/boxb112.jpg',
    },
    {
      discount: 'Up to 68% off',
      event: 'Great Freedom Sale',
      product: 'Cycle and Cycling accessories: Lifelong...',
      image: '../../../assets/amz/boxb113.jpg',
    },
    {
      discount: 'Up to 63% off',
      event: 'Great Freedom Sale',
      product: 'Gas Stoves and Hobs from Top Brands',
      image: '../../../assets/amz/boxb114.jpg',
    },
    {
      discount: 'Up to 38% off',
      event: 'Great Freedom Sale',
      product: 'Lowest Prices of the year on Smartwa...',
      image: '../../../assets/amz/boxb115.jpg',
    },
  ];

  currentIndex = 0;
  visibleCount = 7; // Number of visible products at a time

  // Function to get the visible deals based on the current index
  getVisibleDeals() {
    return this.blockbusterDeals.slice(
      this.currentIndex,
      this.currentIndex + this.visibleCount
    );
  }

  // Function to show the next product (adds 1 product at a time)
  nextDeal() {
    // If we are not at the end, move to the next product
    if (this.currentIndex + 1 < this.blockbusterDeals.length - 5) {
      this.currentIndex += 1;
    } else {
      // If at the end, loop back to the start
      this.currentIndex = 0;
    }
  }

  // Function to show the previous product (decreases 1 product at a time)
  prevDeal() {
    // If we are not at the beginning, move to the previous product
    if (this.currentIndex - 1 >= 0) {
      this.currentIndex -= 1;
    } else {
      // If at the beginning, loop to the last 7 products
      this.currentIndex = this.blockbusterDeals.length - 6;
    }
  }



  currentIndex1 = 0;
  visibleCount1 = 6; // Number of visible products at a time

  // Function to get the visible deals based on the current index
  getVisibleDeals1() {
    return this.blockbusterDeals.slice(this.currentIndex1, this.currentIndex1 + this.visibleCount1);
  }

  // Function to show the next set of products
  nextDeal1() {
    // If we are not at the end, move to the next set of products
    if (this.currentIndex1 + this.visibleCount1 < this.blockbusterDeals.length) {
      this.currentIndex1 += this.visibleCount1;
    } else {
      // If at the end, loop back to the start
      this.currentIndex1 = 0;
    }
  }

  // Function to show the previous set of products
  prevDeal1() {
    // If we are not at the beginning, move to the previous set of products
    if (this.currentIndex1 - this.visibleCount1 >= 0) {
      this.currentIndex1 -= this.visibleCount1;
    } else {
      // If at the beginning, loop to the end
      this.currentIndex1 = this.blockbusterDeals.length - this.visibleCount1;
    }
  }

}