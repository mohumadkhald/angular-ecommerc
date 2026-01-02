import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { AddProductComponent } from '../add-product/add-product.component';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component';
import { CommonModule } from '@angular/common';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { ProductService } from '../../service/product.service';
import { UserService } from '../../service/user.service';
import { SetFirstPasswordComponent } from '../set-first-password/set-first-password.component';
import { MatDialog } from '@angular/material/dialog';
import { ChangePwdComponent } from '../change-pwd/change-pwd.component';

@Component({
  selector: 'app-profile-admin',
  standalone: true,
  templateUrl: './profile-admin.component.html',
  styleUrl: './profile-admin.component.css',
  imports: [CommonModule, CapitalizePipe],
})
export class ProfileAdminComponent {
  user: any;
  products: any[] = [];
  visibleProducts: any[] = [];
  productsToShow = 4;
  hasMoreProducts = true;
  showChangeImageButton = false;

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadProducts();
  }

  loadUserProfile() {
    if (this.authService.isLoggedIn()) {
      this.userService.loadProfile().subscribe(
        (response) => {
          this.user = response;
        },

        (error) => {
          console.error('Error loading user profile', error);
        }
      );
    }
  }

  loadProducts() {
    if (this.authService.isLoggedIn()) {
      this.productService.getProductsByCreatedBy().subscribe((products) => {
        this.products = products;
        this.loadMoreProducts();
      });
    }
  }

  loadMoreProducts() {
    const nextProducts = this.products.slice(
      this.visibleProducts.length,
      this.visibleProducts.length + this.productsToShow
    );
    this.visibleProducts = this.visibleProducts.concat(nextProducts);
    this.hasMoreProducts = this.visibleProducts.length < this.products.length;
  }

  showMoreProducts() {
    this.loadMoreProducts();
  }

  openAddProductModal() {
    const modalRef = this.modalService.open(AddProductComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static', // Prevent closing when clicking outside
      keyboard: false, // Prevent closing with the Esc key
    });

    modalRef.result.then(
      (result) => {
        if (result === 'added') {
          this.toastService.add('Product added successfully', 'success');
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
    this.authService.changePhoto(file, this.user.imageUrl).subscribe(
      (response) => {
        this.toastService.add('Image updated successfully', 'success');
        // this.user.imageUrl = response.message; // Update user image URL
        console.log(this.user.imageUrl);

        // REFRESH PROFILE HERE
        this.userService.refreshProfile().subscribe((updated) => {
          this.user = updated;
        });
      },
      (error) => {
        this.toastService.add('Image upload failed', 'error');
      }
    );
  }

  open(user: any) {
    const modalRef = this.modalService.open(EditUserModalComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.user = user;

    modalRef.result
      .then(
        (result) => {
          if (result === 'updated') {
            this.toastService.add('User edit success', 'success');

            // REFRESH PROFILE HERE
            this.userService.refreshProfile().subscribe((updated) => {
              this.user = updated;
            });
            // this.loadUserProfile(); // Reload user profile after update
          }
        },
        (reason) => {
          console.log('Modal dismissed:', reason);
        }
      )
      .catch((error) => {
        console.error('Modal error:', error);
      });
  }

  redirectToDetails(id: number) {
    this.router.navigate([`products/seller/${id}`]);
  }

  openSetFirstPwd(): void {
    const dialogRef = this.dialog.open(SetFirstPasswordComponent, {
      width: '500px',
      height: '400px',
      data: { name: 'Set Password For Email Address' },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector(
        '.cdk-overlay-pane'
      ) as HTMLElement;

      // Hide dialog initially and apply custom styles
      dialogContainer.style.display = 'none';
      this.renderer.setStyle(dialogContainer, 'position', 'relative');
      this.renderer.setStyle(dialogContainer, 'top', '0px');
      this.renderer.setStyle(dialogContainer, 'z-index', '100');
      dialogContainer.style.display = 'block'; // Show after styling
    });

    dialogRef.afterClosed().subscribe((passwordSet: boolean) => {
      if (passwordSet) {
        this.user.needPassword = false; // 🔥 instant UI update
      }

      this.loadUserProfile(); // optional sync with backend
    });
  }

  openChangePwd(): void {
    const dialogRef = this.dialog.open(ChangePwdComponent, {
      width: '500px',
      height: '520px',
      data: { name: 'Change Password' },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector(
        '.cdk-overlay-pane'
      ) as HTMLElement;

      // Hide dialog initially and apply custom styles
      dialogContainer.style.display = 'none';
      this.renderer.setStyle(dialogContainer, 'position', 'relative');
      this.renderer.setStyle(dialogContainer, 'top', '0px');
      this.renderer.setStyle(dialogContainer, 'z-index', '100');
      dialogContainer.style.display = 'block'; // Show after styling
    });

    dialogRef.afterClosed().subscribe(() => {
      // window.location.reload()
      this.loadUserProfile();
    });
  }
}
