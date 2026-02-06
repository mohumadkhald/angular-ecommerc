// cart.component.ts
import { CommonModule, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { defer, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { CartItem } from '../../interface/cat';
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';
import { ToastService } from '../../service/toast.service';
import { AddressModalComponent } from '../address-modal/address-modal.component';
import { RemoveNotFoundItemStockModalComponent } from '../remove-not-found-item-stock-modal/remove-not-found-item-stock-modal.component';
import { ConfigService } from '../../service/config.service';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  standalone: true,
  imports: [
    NgFor,
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CapitalizePipe,
    MatProgressSpinner
],
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
  shipping: number = 20;
  apiUrl: string;
  cardVendor!: string;
  totalpriceDiscounted: number = 0;
  showCheckoutModal: boolean = false;
  count$!: Observable<number>;
  count: number = 0;
  loading: boolean = true;

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
    private configService: ConfigService,
  ) {
    this.apiUrl = configService.getApiUri();
  }

  ngOnInit(): void {
    this.count$ = this.getCountOfItems();
    this.count$.subscribe((value) => (this.count = value ?? 0));

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
      expirationDate: ['', [Validators.required, expirationDateValidator()]], // Required field for expiration date
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]], // Required field for CVV, must be 3 digits
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  previousValue = '';

  onExpInput(event: any) {
    const input = event.target;
    let value: string = input.value;

    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');

    // Limit to 4 digits (MMYY)
    if (digits.length > 4) {
      digits = digits.substring(0, 4);
    }

    // Auto-insert slash only if typing forward
    let newValue = digits;
    const cursorPos = input.selectionStart || 0;
    const isDeleting =
      digits.length < this.previousValue.replace(/\D/g, '').length;

    if (!isDeleting && digits.length > 2) {
      newValue = digits.substring(0, 2) + '/' + digits.substring(2);
    } else if (!isDeleting && digits.length === 2 && !value.includes('/')) {
      newValue = digits + '/';
    }

    input.value = newValue;
    this.paymentForm
      .get('expirationDate')
      ?.setValue(newValue, { emitEvent: false });

    // Set cursor after slash if just inserted
    let newCursorPos = cursorPos;
    if (!isDeleting && digits.length === 2 && cursorPos === 2) {
      newCursorPos = 3;
    }

    input.setSelectionRange(newCursorPos, newCursorPos);
    this.previousValue = newValue;
  }

  private loadCartItems(): void {
    this.cartServerService.getCart().subscribe((items) => {
      this.cartServerService.count$.subscribe((count) => (this.count = count ?? 0));
      this.cartItems1 = items;
      this.updateTotalPrice(); // recalculates without extra requests
      this.loading = false;
    });
  }

  private updateTotalPrice(): void {
    if (this.auth()) {
      this.totalprice = this.cartServerService.getTotalPrice();
      this.totalpriceDiscounted =
        this.cartServerService.getTotalDiscountedPrice();
    } else {
      this.totalprice = this.cartService.getTotalPrice();
      this.totalpriceDiscounted = this.cartService.getTotalDiscountedPrice();
    }
  }

  increaseQuantity(itemId: number): void {
    if (this.auth()) {
      this.cartServerService.increaseQuantity(itemId).subscribe(() => {
        this.loadCartItems(); // <---- ALWAYS refresh here
        console.log('Increased item ID:', this.cartItems1);
      });
    } else {
      this.cartService.increaseQuantity(itemId);
      console.log('Increased item ID:', this.cartItems);
      this.cartItems = this.cartService.getCart();
      this.updateTotalPrice();
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (this.auth()) {
      this.cartServerService
        .decreaseQuantity(item.itemID, item.quantity)
        .subscribe(() => {
          this.loadCartItems();
        });
    } else {
      this.cartService.decreaseQuantity(item);
      this.cartItems = this.cartService.getCart();
      this.updateTotalPrice();
    }
  }

  removeItem(item: CartItem): void {
    this.cartServerService.deleteItem(item.itemID).subscribe(() => {
      this.loadCartItems();
    });
  }

  removeFromCart(product: any): void {
    this.cartService.removeFromCart(product);
    this.cartItems = this.cartService.getCart();
    this.updateTotalPrice();
  }

  getCountOfItems(): any {
    if (this.authService.isLoggedIn()) {
      this.loadCartItems();
      return this.cartServerService.count$;
    }

    // LOCAL CART
    this.cartItems = this.cartService.getCart(); // ensure cart is loaded
    this.updateTotalPrice();
    this.loading = false;
    return this.cartService.count$;
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

  // removeToast(): void {
  //   this.toastService.remove();
  // }

  openAddressModal() {
    const modalRef = this.modalService.open(AddressModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false, // Prevent closing with the Esc key
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
      },
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
      };

      this.http.post(`${this.apiUrl}/orders`, order).subscribe(
        (response) => {
          console.log('Order submitted successfully', response);
          this.toastService.add('Order Success', 'success');
          this.loadCartItems();
        },
        (error) => {
          console.log('Error submitting order', error);
          this.handleOrderError(error.error.errors);
        },
      );
    }
  }

  private handleOrderError(errors: any) {
    console.log('Order Errors:', errors);
    const productIssues = Object.keys(errors).map((key) => ({
      title: key,
      message: errors[key].message,
      requestedQuantity: errors[key].requestedQuantity,
      availableQuantity: errors[key].availableQuantity,
    }));
    console.log('Product Issues:', productIssues);

    const cartItemsWithIssues = this.cartItems1.filter((item) =>
      productIssues.some((issue) => issue.title === item.productTitle),
    );

    console.log('Cart Items with Issues:', cartItemsWithIssues);

    this.openNotFoundStockModal(
      cartItemsWithIssues,
      productIssues,
      this.paymentForm.value,
      this.addressForm.value,
    );
  }

  openNotFoundStockModal(
    cartItemsWithIssues: any[],
    productIssues: any[],
    paymentInfo: any,
    address: any,
  ) {
    const modalRef = this.modalService.open(
      RemoveNotFoundItemStockModalComponent,
      {
        size: 'lg',
        centered: true,
        backdrop: 'static', // Prevent closing when clicking outside
        keyboard: false, // Prevent closing with the Esc key
      },
    );

    modalRef.componentInstance.productIssues = productIssues;
    modalRef.componentInstance.cartItemsWithIssues = cartItemsWithIssues;
    modalRef.componentInstance.paymentInfo = paymentInfo;
    modalRef.componentInstance.address = address;
    modalRef.componentInstance.numItems = this.cartItems1.length;

    modalRef.result.then(
      (result) => {
        console.log('Dialog was closed', result);
        this.loadCartItems();
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      },
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

  openCheckoutModal() {
    this.showCheckoutModal = true;
  }
  closeCheckoutModal() {
    this.showCheckoutModal = false;
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
    cardNameFunc: (cardNum: string) => string,
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
function expirationDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null; // required validator will handle empty

    // Match MM/YY format
    const regex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    if (!regex.test(value)) return { invalidFormat: true };

    // Split month/year
    const [monthStr, yearStr] = value.split('/');
    const month = parseInt(monthStr, 10);
    let year = parseInt(yearStr, 10);

    // If year is two digits, convert to 4 digits
    if (year < 100) {
      const currentYear = new Date().getFullYear();
      const prefix = Math.floor(currentYear / 100) * 100; // e.g., 2000
      year += prefix;
    }

    const now = new Date();
    const expiration = new Date(year, month - 1, 1); // set to first day of month

    // Expiration must be >= current month
    if (expiration < new Date(now.getFullYear(), now.getMonth(), 1)) {
      return { expired: true };
    }

    return null; // valid
  };
}
