import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from '../../service/cart.service';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { AuthService } from '../../service/auth.service';
import { CartServerService } from '../../service/cart-server.service';
import { ToastService } from '../../service/toast.service';
import { AddToCartModalComponent } from '../add-to-cart-modal/add-to-cart-modal.component';
@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  imports: [
    CommonModule,
    NgClass,
    NgIf,
    NgbRatingModule,
    FormsModule,
    CapitalizePipe,
    MatButtonModule,
     MatIconModule
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
    private modalService: MatDialog,
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
    // console.log('Navigating to product details for ID:', this.product);
    this.router.navigate([
      `categories/${this.product.subCategory.categoryName}/${this.product.subCategory.name}/products/${id}`,
    ]);
  }

  open(product: any) {
    const modalRef = this.modalService.open(AddToCartModalComponent, {
      width: '600px', // Adjust width as needed
      panelClass: 'dialog-centered', // Add custom class for centering
      disableClose: true, // Prevent closing when clicking outside
    });
    modalRef.componentInstance.product = product;
    modalRef.afterClosed().subscribe((result) => {
      if (result === 'added') {
        // console.log('Product added to cart:', product);
        this.toastService.add(
          'Product ' +
            product.productTitle.toUpperCase() +
            ' added Successfully to Cart',
          'success'
        );
      }
    });
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
      (v: any) => v.color === 'no_color' && v.size === 'NO_SIZE'
    );
    this.maxQuantity = variation ? variation.quantity : 0;
    return this.quantity <= this.maxQuantity;
  }
  open2(product: any) {
    this.submitted = true;
    if (this.quantity <= 0 || !this.validateQuantity2()) {
      return; // Validation failed
    }

    const productToAdd = {
      productId: product.productId,
      title: product.productTitle,
      imageUrl: product.imageUrls[0],
      quantity: this.quantity,
      price: product.price,
      color: 'no_color',
      size: 'NO_SIZE',
      discount: this.product.discountPercent,
      discountedPrice: this.product.discountPrice,
    };

    if (!this.auth()) {
      this.cartService.addToCart(productToAdd);
      this.toastService.add(
        'Product ' + product.productTitle.toUpperCase() + ' added to Cart',
        'success'
      );
    } else {
      this.cartServerService.addToCart(productToAdd);
      this.toastService.add(
        'Product ' + product.productTitle.toUpperCase() + ' added to Cart',
        'success'
      );
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
