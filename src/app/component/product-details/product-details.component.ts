import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { ProductsService } from '../services/products.service';
import { CartService } from '../services/cart.service';
import {DiscountPipe} from "../services/discount.pipe";


@Component({
    selector: 'app-product-details',
    standalone: true,
    templateUrl: './product-details.component.html',
    styleUrl: './product-details.component.css',
    imports: [NgIf, NgFor, StarRatingComponent, CommonModule, DiscountPipe]
})
export class ProductDetailsComponent implements OnInit {
  productItem: any;
  counter: number = 0
  @Input() id !: number;
  cartItems: { product: any; quantity: number }[] = [];
  constructor(private ProductsService : ProductsService,private cartService: CartService){}
  ngOnInit(){

   this.cartItems = this.cartService.getCart();


    console.log(this.id)
    this.ProductsService.getProductById(this.id).subscribe((res) => {
      if (res) {
        this.productItem = res;
        console.log(this.productItem);
      } else {
        console.error('No products found in the response.');
      }
    })
  }
  addToCart(product: any): void {
    this.cartService.addToCart(this.productItem);

  }



}
