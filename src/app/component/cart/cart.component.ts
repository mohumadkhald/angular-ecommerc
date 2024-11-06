// cart.component.ts
import { CommonModule, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../config.service';
import { CartItem } from '../../interface/cat';
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { ToastService } from '../../service/toast.service';
import { AddressModalComponent } from '../address-modal/address-modal.component';
import { ExpiredSessionDialogComponent } from '../expired-session-dialog/expired-session-dialog.component';
import { RemoveNotFoundItemStockModalComponent } from '../remove-not-found-item-stock-modal/remove-not-found-item-stock-modal.component';

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
  counter: number = 0;
  cartItems1: any[] = []; // Replace with actual CartItem type
  private authSubscription!: Subscription;
  paymentForm!: FormGroup;
  addressForm!: FormGroup;
  shipping: number = 0;
  apiUrl: string;
  cardVendor!: string;
  totalpriceDiscounted: number = 0;

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
      cardHolderName: ['', Validators.required], // Required field for cardholder's name
      cardNumber: [
        '',
        [
          Validators.required, // Card number is required
          this.cardValidator(this.luhn, this.cardName), // Custom validator for additional card validation (e.g., Luhn algorithm)
        ],
      ],
      expirationDate: ['', Validators.required], // Required field for expiration date
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]], // Required field for CVV, must be 3 digits
    });
    console.log(this.cardVendor);
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
          this.totalpriceDiscounted = items.reduce(
            (total, item) => total + item.totalPriceDiscounted,
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
    if(this.auth())
    {
      this.cartServerService.increaseQuantity(product);
      this.updateTotalPrice();
      this.cartItems = this.cartService.getCart();
    } else {
      this.cartService.increaseQuantity(product);
      this.updateTotalPrice();
      this.cartItems = this.cartService.getCart();
    }

  }

  decreaseQuantity(product: any): void {
    if(this.auth())
      {
        this.cartServerService.decreaseQuantity(product);
        this.updateTotalPrice();
        this.cartItems = this.cartService.getCart();
      } else {
        this.cartService.decreaseQuantity(product);
        this.updateTotalPrice();
        this.cartItems = this.cartService.getCart();
      }
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
    const productIssues = Object.keys(errors).map((key) => ({
      title: key,
      message: errors[key].message,
      requestedQuantity: errors[key].requestedQuantity,
      availableQuantity: errors[key].availableQuantity,
    }));

    const cartItemsWithIssues = this.cartItems1.filter((item) =>
      productIssues.some((issue) => issue.title === item.productTitle)
    );

    console.log('Cart Items with Issues:', cartItemsWithIssues);

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

    modalRef.componentInstance.productIssues = productIssues;
    modalRef.componentInstance.cartItemsWithIssues = cartItemsWithIssues;
    modalRef.componentInstance.paymentInfo = paymentInfo;
    modalRef.componentInstance.address = address;

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

  luhn(input: string): boolean {
    let notAllowed = '-';
    let creditNumber = input
      .split('')
      .filter((num) => notAllowed.indexOf(num) < 0);

    let len = creditNumber.length;
    let revCredit = creditNumber.reverse();

    let firstNums: number[] = [];
    let otherNums: number[] = [];

    for (let i = 0; i < revCredit.length; i++) {
      const digit = Number(revCredit[i]); // Convert string to number
      if (i % 2 === 0) {
        firstNums.push(digit);
      } else {
        otherNums.push(Math.floor((digit * 2) / 10) + ((digit * 2) % 10));
      }
    }

    let totalSum = 0;
    if (firstNums && otherNums) {
      let firstSum = firstNums.reduce((p, c) => p + c, 0);
      let otherSum = otherNums.reduce((p, c) => p + c, 0);
      totalSum = firstSum + otherSum;
    }
    return totalSum % 10 === 0;
  }

  cardName(cardNum: string): string {
    let notAllowed = '-';
    let creditNumber = cardNum
      .split('')
      .filter((num) => notAllowed.indexOf(num) < 0);
    let len = creditNumber.length;

    if (creditNumber[0] == '4' && (len === 13 || len === 16)) {
      return 'Visa';
    } else if (
      len === 15 &&
      Number(creditNumber[0]) === 3 &&
      (creditNumber[1] === '4' || creditNumber[1] === '7')
    ) {
      return 'American Express';
    } else if (
      len === 16 &&
      Number(creditNumber[0]) === 5 &&
      Number(creditNumber[1]) >= 1 &&
      Number(creditNumber[1]) <= 5
    ) {
      return 'MasterCard';
    } else {
      return 'Invalid';
    }
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digit characters
  
    // Group digits into sets of 4 and join with hyphens
    value = value.replace(/(.{4})/g, '$1-').trim();
    
    // Remove trailing hyphen if the value ends with one
    if (value.endsWith('-')) {
      value = value.slice(0, -1);
    }
  
    // Set the formatted value back to the input field
    input.value = value;
  
    // Update the form control value without resetting validation
    this.paymentForm.get('cardNumber')?.setValue(value, { emitEvent: false });
  }
  

  cardValidator(
    luhnFunc: (input: string) => boolean,
    cardNameFunc: (cardNum: string) => string
  ): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const cardNumber = control.value;
      if (!cardNumber) {
        return null; // Don't validate if there's no input
      }

      const isValidCard = luhnFunc(cardNumber); // Use the passed luhn function
      const cardVendor = cardNameFunc(cardNumber); // Use the passed cardName function
      this.cardVendor = this.cardName(cardNumber);

      if (!isValidCard) {
        return { invalidCard: true }; // Custom error key
      }

      if (cardVendor === 'Invalid') {
        return { invalidVendor: true }; // Custom error key
      }

      return null; // Valid card
    };
  }
}
