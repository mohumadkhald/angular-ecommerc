import { Component, EventEmitter, Input, OnInit, Output, Pipe } from '@angular/core';
import { CommonModule, NgClass, NgIf, NgStyle } from '@angular/common';
import { StarRatingComponent } from "../star-rating/star-rating.component";
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-product-card',
    standalone: true,
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css',
    imports: [CommonModule, NgClass, NgStyle, NgIf, StarRatingComponent, NgbRatingModule]
})
export class ProductCardComponent implements OnInit {
  @Input() productItem : any ;
  @Output() sendToParent = new EventEmitter<number>();
  cartItems: { product: any; quantity: number }[] = [];

  constructor(private router: Router,private cartService: CartService) {}
  ngOnInit(): void {
    this.cartItems = this.cartService.getCart();
    
  }
  addToCart(product: any): void {
    this.cartService.addToCart(this.productItem);
  }
  redirectToDetails(id: number) {
    this.router.navigate([`product/details/${id}`], { 
     
    });
    
  }
 
  
}
