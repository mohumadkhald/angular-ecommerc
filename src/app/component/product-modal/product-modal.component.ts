import {AfterViewChecked, ChangeDetectorRef, Component, Input, NgZone} from '@angular/core';
import {NgbActiveModal, NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {CommonModule, NgForOf, NgStyle} from "@angular/common";
import {NgxImgZoomModule, NgxImgZoomService} from "ngx-img-zoom";
import {NgxImageZoomModule} from "ngx-image-zoom";
import {BrowserModule} from "@angular/platform-browser";
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [
  FormsModule, NgbModule, NgForOf, NgStyle, CommonModule
  ],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.css'
})

export class ProductModalComponent {
  @Input() product: any;
  selectedSize: string = '';
  selectedColor: string = '';
  scaleRange: number = 1;
  xValue: number = 0;
  yValue: number = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private cartService:CartService)
  {}





  close() {
    this.activeModal.close();
  }

  addToCart() {
    console.log(`Added to cart: ${this.product.productTitle}, Size: ${this.selectedSize}, Color: ${this.selectedColor}`);
    this.cartService.addToCart(this.product);
    this.activeModal.close();
  }

  protected readonly Number = Number;
}
