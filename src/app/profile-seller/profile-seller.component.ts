import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../service/auth.service';
import { AddProductComponent } from '../add-product/add-product.component';

@Component({
  selector: 'app-profile-seller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-seller.component.html',
  styleUrl: './profile-seller.component.css'
})
export class ProfileSellerComponent {
  constructor(private authService: AuthService, private router: Router, private modalService: NgbModal) {}

  user:any;

  ngOnInit(): void {
      this.authService.getProfile().subscribe(
        response => {
          console.log('profile successful', response);
          this.user = response;
        },
        error => {
          console.error('profile error', error);
        }
      );
      this.loadProducts();
  }

  products: any = [
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(112).webp' },
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(107).webp' },
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(108).webp' },
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(114).webp' },
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(112).webp' },
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(107).webp' },
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(108).webp' },
    { image: 'https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(114).webp' },
    // Add more product images here
  ];

  visibleProducts: any = [];
  productsToShow = 4;
  hasMoreProducts = true;

  loadProducts() {
    const nextProducts = this.products.slice(this.visibleProducts.length, this.visibleProducts.length + this.productsToShow);
    this.visibleProducts = this.visibleProducts.concat(nextProducts);
    this.hasMoreProducts = this.visibleProducts.length < this.products.length;
  }

  showMoreProducts() {
    this.loadProducts();
  }




  openAddProductModal() {
    const modalRef = this.modalService.open(AddProductComponent, { size: 'lg', centered: true }); // Adjust size as needed
    // modalRef.componentInstance.productId = productId; // Example: passing data to modal if needed

    modalRef.result.then(
      (result) => {
        console.log('Product added:', result);
        // Handle product addition if needed
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
        // Handle modal dismiss if needed
      }
    );
  }
}
