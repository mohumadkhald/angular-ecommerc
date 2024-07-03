import { Component, Input } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { ProductsService } from '../../service/products.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-page-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-details.component.html',
  styleUrl: './page-details.component.css'
})
export class PageDetailsComponent {
  productItem: any;
  counter: number = 0
  @Input() id !: number;
  cartItems: { product: any; }[] = [];
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
