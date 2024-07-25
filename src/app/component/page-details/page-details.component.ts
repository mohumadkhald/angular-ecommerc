import { Component, Input } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-details.component.html',
  styleUrl: './page-details.component.css',
})
export class PageDetailsComponent {
  productItem: any;
  counter: number = 0;
  @Input() id!: number;
  cartItems: { product: any }[] = [];
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
  ) {}
  ngOnInit() {
    this.cartItems = this.cartService.getCart();
    this.productService.getProductById(this.id).subscribe((res) => {
      if (res) {
        this.productItem = res;
      } else {
      }
    }, (error) => {
      if(error.status==403){
        this.router.navigate(['notfound']);
      }
    }
  );
  }
  addToCart(product: any): void {
    this.cartService.addToCart(this.productItem);
  }
}
