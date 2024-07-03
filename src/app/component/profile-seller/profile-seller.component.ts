import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { AddProductComponent } from '../add-product/add-product.component';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component';
import { UserService } from '../../service/user.service';


@Component({
  selector: 'app-profile-seller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-seller.component.html',
  styleUrl: './profile-seller.component.css'
})
export class ProfileSellerComponent implements OnInit {
  user: any;
  products: any[] = [/*...*/];
  visibleProducts: any[] = [];
  productsToShow = 4;
  hasMoreProducts = true;
  showChangeImageButton = false;

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    public toastService: ToastService,
  ) {}

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

  loadProducts() {
    const nextProducts = this.products.slice(this.visibleProducts.length, this.visibleProducts.length + this.productsToShow);
    this.visibleProducts = this.visibleProducts.concat(nextProducts);
    this.hasMoreProducts = this.visibleProducts.length < this.products.length;
  }

  showMoreProducts() {
    this.loadProducts();
  }

  openAddProductModal() {
    const modalRef = this.modalService.open(AddProductComponent, { size: 'lg', centered: true });

    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          console.log('Product added:');
          this.toastService.add('Product added successfully');
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
        console.log('Image uploaded successfully:', response);
        this.toastService.add('Image updated successfully');
        this.user.imageUrl = response.message; // Update user image URL
      },
      error => {
        console.error('Image upload error:', error);
        this.toastService.add('Image upload failed');
      }
    );
  }

  open(user: any) {
    const modalRef = this.modalService.open(EditUserModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.user = user;
    modalRef.result.then(
      (result) => {
        this.toastService.add('User edit success');
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }
}
