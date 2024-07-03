import { CommonModule, NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from '../../service/cart.service';
import { StarRatingComponent } from "../star-rating/star-rating.component";

import { ToastService } from '../../service/toast.service';
import { ProductModalComponent } from '../product-modal/product-modal.component';
@Component({
    selector: 'app-product-card',
    standalone: true,
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css',
    imports: [CommonModule, NgClass, NgStyle, NgIf, StarRatingComponent, NgbRatingModule]
})
export class ProductCardComponent implements OnInit {
  @Input() product : any ;
  @Output() sendToParent = new EventEmitter<number>();
  cartItems: { product: any; }[] = [];

  constructor(private router: Router,
    private cartService: CartService,
    private modalService: NgbModal,
    public toastService: ToastService
  ) {}
  ngOnInit(): void {
    this.cartItems = this.cartService.getCart();

  }
  addToCart(product: any): void {
    this.cartService.addToCart(this.product);
  }
  redirectToDetails(id: number) {
    this.router.navigate([`product/details/${id}`], {

    });

  }

  open(product: any) {
    const modalRef = this.modalService.open(ProductModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.product = product;
    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add('Product added successfully to Cart');
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }
  

  removeToast(): void {
    this.toastService.remove();
  }

  showToast(): void {
    this.toastService.add('This is a toast message.');
  }

}
