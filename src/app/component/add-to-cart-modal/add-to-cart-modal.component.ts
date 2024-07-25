import { CommonModule, NgForOf, NgStyle } from "@angular/common";
import { ChangeDetectorRef, Component, Input, NgZone } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-add-to-cart-modal',
  standalone: true,
  imports: [
  FormsModule, NgbModule, NgForOf, NgStyle, CommonModule
  ],
  templateUrl: './add-to-cart-modal.component.html',
  styleUrl: './add-to-cart-modal.component.css'
})

export class AddToCartModalComponent {
  @Input() product: any;
  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;
  submitted: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private cartService: CartService,
    private authService: AuthService,
    private cartServerService: CartServerService,
  ) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  auth(): boolean {
    return this.authService.isLoggedIn();
  }

  close() {
    this.activeModal.close();
  }

  addToCart() {
    this.submitted = true;

    if (!this.selectedSize || !this.selectedColor || !this.quantity) {
      return;
    }

    const productToAdd = {
      ...this.product,
      size: this.selectedSize,
      color: this.selectedColor,
      quantity: this.quantity
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
    } else {
      this.cartServerService.addToCart(productToAdd);
    }

    this.activeModal.close('added');
  }
}

