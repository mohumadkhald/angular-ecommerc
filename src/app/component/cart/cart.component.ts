// cart.component.ts
import { CommonModule, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '../../interface/cat';
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { ToastService } from '../../service/toast.service';
import { ExpiredSessionDialogComponent } from '../expired-session-dialog/expired-session-dialog.component';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AddressModalComponent } from '../address-modal/address-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RemoveNotFoundItemStockModalComponent } from '../remove-not-found-item-stock-modal/remove-not-found-item-stock-modal.component';
import { ConfigService } from '../../config.service';

@Component({
  standalone: true,
  imports: [NgFor, CommonModule, RouterLink, ReactiveFormsModule],
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: { product: any }[] = [];
  totalprice: number = 0;
  // shipping: number = 20;
  counter: number = 0;
  cartItems1: CartItem[] = [];
  private authSubscription!: Subscription;
  paymentForm!: FormGroup;
  addressForm!: FormGroup;
  shipping: number = 0;
  apiUrl: string;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private cartServerService: CartServerService,
    public toastService: ToastService,
    private router: Router,
    private dialog: MatDialog,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = configService.getApiUri();
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          this.loadCartItems();
        } else {
          this.cartItems = this.cartService.getCart();
          this.updateTotalPrice();
        }
      }
    );

    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: [null, Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: [null, Validators.required],
    });

    this.paymentForm = this.fb.group({
      cardHolderName: ['', Validators.required],
      cardNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(16),
          Validators.maxLength(16),
        ],
      ],
      expirationDate: [
        '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)],
      ],
      cvv: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
      ],
    });
  }
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  private loadCartItems(): void {
    this.cartServerService.getCart().subscribe(
      (items) => {
        this.cartItems1 = items;
        this.updateTotalPrice();
      },
      (error) => {}
    );
  }

  showExpiredSessionDialog(message: string, path: string): void {
    this.dialog.open(ExpiredSessionDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message: message, path: path },
    });
  }

  private updateTotalPrice(): void {
    if (this.auth()) {
      this.cartServerService.getCart().subscribe(
        (items) => {
          this.cartItems1 = items;
          this.totalprice = items.reduce(
            (total, item) => total + item.totalPrice,
            0
          );
        },
        (error) => {}
      );
    } else {
      this.totalprice = this.cartService.getTotalPrice();
    }
  }

  increaseQuantity(product: any): void {
    this.cartService.increaseQuantity(product);
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }

  decreaseQuantity(product: any): void {
    this.cartService.decreaseQuantity(product);
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }
  removeItemCart(itemID: any): void {
    if (this.auth()) {
      this.cartServerService.deleteItem(itemID);
      this.loadCartItems();
    }
  }

  removeFromCart(product: any): void {
    this.cartService.removeFromCart(product);
    this.cartItems = this.cartService.getCart();
  }
  getCountOfItems() {
    if (this.auth()) {
      return this.cartServerService.getCountOfItems();
    }
    return this.cartService.getCountOfItems();
  }

  clearCart(): void {
    if (this.auth()) {
      this.cartServerService.clearCart();
      this.loadCartItems();
    }
    this.cartService.clearCart();
    this.updateTotalPrice();
    this.cartItems = this.cartService.getCart();
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  removeToast(): void {
    this.toastService.remove();
  }

  showToast(): void {
    this.toastService.add('This is a toast message.');
  }

  openAddressModal() {
    const modalRef = this.modalService.open(AddressModalComponent, {
      size: 'lg',
      centered: true,
    });

    modalRef.result.then(
      (result) => {
        console.log('Address saved:', result);
        this.addressForm.setValue(result);
        console.log('addressForm', this.addressForm);
        this.submitOrder();
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }

  handleCheckout(): void {
    if (this.addressForm.valid) {
      // Address form is valid, proceed with order submission
      this.submitOrder();
    } else {
      // Address form is not valid, open the address modal
      this.openAddressModal();
    }
  }

  submitOrder() {
    if (this.paymentForm.valid && this.addressForm.valid) {
      const order = {
        status: 'PENDING',
        paymentInfo: this.paymentForm.value,
        address: this.addressForm.value,
        orderDate: new Date().toISOString(),
        deliveryDate: null,
      };

      this.http.post(`${this.apiUrl}/orders`, order).subscribe(
        (response) => {
          console.log('Order submitted successfully', response);
          this.toastService.add('Order Success');
          this.loadCartItems();
        },
        (error) => {
          console.log('Error submitting order', error);
          this.handleOrderError(error.error.errors);
        }
      );
    }
  }

  private handleOrderError(errors: any) {
    // Extract the product issues from the error response
    const productIssues = Object.keys(errors).map((key) => ({
      title: key, // This should be the product title from the error response
      message: errors[key].message, // The error message
      requestedQuantity: errors[key].requestedQuantity, // The quantity requested in the order
      availableQuantity: errors[key].availableQuantity, // The available quantity in stock
    }));

    // Find matching items in the cart based on the product title
    const cartItemsWithIssues = this.cartItems1.filter((item) =>
      productIssues.some((issue) => issue.title === item.productTitle)
    );

    console.log('Cart Items with Issues:', cartItemsWithIssues);

    // Pass the cart items with issues, product issues, address, and payment information to the modal
    this.openNotFoundStockModal(
      cartItemsWithIssues,
      productIssues,
      this.paymentForm.value,
      this.addressForm.value
    );
  }

  openNotFoundStockModal(
    cartItemsWithIssues: any[],
    productIssues: any[],
    paymentInfo: any,
    address: any
  ) {
    const modalRef = this.modalService.open(
      RemoveNotFoundItemStockModalComponent,
      {
        size: 'lg',
        centered: true,
      }
    );

    // Pass the product issues, cart items with issues, payment info, and address to the modal component
    modalRef.componentInstance.productIssues = productIssues;
    modalRef.componentInstance.cartItemsWithIssues = cartItemsWithIssues;
    modalRef.componentInstance.paymentInfo = paymentInfo;
    modalRef.componentInstance.address = address;

    // Handle the modal result
    modalRef.result.then(
      (result) => {
        console.log('Dialog was closed', result);
        this.loadCartItems();
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }
}
