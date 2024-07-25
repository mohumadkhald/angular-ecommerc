import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { AddProductComponent } from '../add-product/add-product.component';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component';
import { CapitalizePipe } from "../../pipe/capitalize.pipe";
import { ProductService } from '../../service/product.service';


@Component({
    selector: 'app-profile-seller',
    standalone: true,
    templateUrl: './profile-seller.component.html',
    styleUrl: './profile-seller.component.css',
    imports: [CommonModule, CapitalizePipe]
})
export class ProfileSellerComponent implements OnInit {
  user: any;
  products: any[] = [];
  visibleProducts: any[] = [];
  productsToShow = 4;
  hasMoreProducts = true;
  showChangeImageButton = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    public toastService: ToastService,
    private productsService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadProducts();
  }

  loadUserProfile() {
    this.authService.getProfile().subscribe(
      response => {
        this.user = response;
      },
      error => {
        console.error('Error loading user profile', error);
      }
    );
  }

  loadProducts() {
    this.productsService.getProductsByCreatedBy().subscribe(products => {
      this.products = products;
      console.log(this.products);
      this.loadMoreProducts();
    });
  }

  loadMoreProducts() {
    const nextProducts = this.products.slice(this.visibleProducts.length, this.visibleProducts.length + this.productsToShow);
    this.visibleProducts = this.visibleProducts.concat(nextProducts);
    this.hasMoreProducts = this.visibleProducts.length < this.products.length;
  }

  showMoreProducts() {
    this.loadMoreProducts();
  }

  openAddProductModal() {
    const modalRef = this.modalService.open(AddProductComponent, { size: 'lg', centered: true });

    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add('Product added successfully');
          this.loadProducts(); // Reload products after adding a new one
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadImage(file);
    }
  }

  uploadImage(file: File) {
    this.authService.changePhoto(file).subscribe(
      response => {
        this.toastService.add('Image updated successfully');
        this.user.imageUrl = response.message; // Update user image URL
      },
      error => {
        this.toastService.add('Image upload failed');
      }
    );
  }

  open(user: any) {
    const modalRef = this.modalService.open(EditUserModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.user = user;
    modalRef.result.then(
      (result) => {
        if (result === 'updated') {
          this.toastService.add('User edit success');
          this.loadUserProfile(); // Reload user profile after update
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    ).catch((error) => {
      console.error('Modal error:', error);
    });
  }

  redirectToDetails(id: number) {
    this.router.navigate([`products/seller/${id}`]);
  }
}
