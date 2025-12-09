import { CommonModule, NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from '../../service/cart.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

import { ToastService } from '../../service/toast.service';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
import { CartServerService } from '../../service/cart-server.service';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  imports: [
    CommonModule,
    NgClass,
    NgStyle,
    NgIf,
    StarRatingComponent,
    NgbRatingModule,
    FormsModule,
    CapitalizePipe
  ],
})
export class ProductCardComponent implements OnInit {
  @Input() product: any;
  @Output() sendToParent = new EventEmitter<number>();
  cartItems: { product: any }[] = [];
  maxQuantity: any;
  quantity: number = 1;
  submitted: boolean = false;


  constructor(
    private router: Router,
    private cartService: CartService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private cartServerService: CartServerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCart();
  }

  addToCart(product: any): void {
    this.cartService.addToCart(this.product);
  }

  redirectToDetails(id: number) {
    this.router.navigate([`products/${id}`]);
  }

  open(product: any) {
    const modalRef = this.modalService.open(AddToCartModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false,    // Prevent closing with the Esc key
    });
    modalRef.componentInstance.product = product;
    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add('Product added successfully to Cart', 'success');
        }
      },
      (reason) => {}
    );
  }

  // open2(product: any) {
  //   const modalRef = this.modalService.open(AddToCartModalComponent, {
  //     size: 'lg',
  //     centered: true,
  //   });
  //   modalRef.componentInstance.product = product;
  //   modalRef.componentInstance.haveSpec = false;
  //   modalRef.result.then(
  //     (result) => {
  //       if (result === 'added') {
  //         this.toastService.add('Product added successfully to Cart');
  //       }
  //     },
  //     (reason) => {}
  //   );
  // }

  validateQuantity2(): boolean {
    const variation = this.product.productVariations.find(
      (v: any) => v.color === "no_color" && v.size === "NO_SIZE"
    );
    this.maxQuantity = variation ? variation.quantity : 0;
    return this.quantity <= this.maxQuantity;
  }
  open2(product: any) {
    this.submitted = true;
    if (
      this.quantity <= 0 ||
      !this.validateQuantity2()
    ) {
      return; // Validation failed
    }

    const productToAdd = {
      productId: product.productId,
      title: product.productTitle,
      imageUrl: product.imageUrls[0],
      quantity: this.quantity,
      price: product.price,
      color: "no_color",
      size: "NO_SIZE"
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
      this.toastService.add('Product '+ product.productTitle + ' added to Cart', 'success');
    } else {
      this.cartServerService.addToCart(productToAdd);
      this.toastService.add('Product '+ product.productTitle + ' added to Cart', 'success');
    }

  }

  // Method to get the count of in-stock and out-of-stock products
  static getStockCounts(products: any[]): {
    inStockCount: number;
    outOfStockCount: number;
  } {
    let inStockCount = 0;
    let outOfStockCount = 0;
    products.forEach((product) => {
      if (product.inStock) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
    });

    return { inStockCount, outOfStockCount };
  }
  
  auth(): boolean {
    return this.authService.isLoggedIn();
  }

}
