import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProductComponent } from '../../component/add-product/add-product.component';
import { PaginationComponent } from "../../component/pagination/pagination.component";
import { ProductsService } from '../../dashboard-service/products.service';
import { ToastService } from '../../service/toast.service';
import { DashboardComponent } from '../dashboard.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [PaginationComponent, CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  products: any[] = [];
  token: any = '';
  currentPage = 1;
  totalPages: number[] = [];

  constructor(
    private router: Router,
    private prodcutsService: ProductsService,
    private modalService: NgbModal,
    public toastService: ToastService,
    private dashboardComponent: DashboardComponent // Inject DashboardComponent
  ) { }

  ngOnInit(): void {
    this.fetchProducts(this.currentPage-1);
  }

  fetchProducts(page: number = 1, pageSize: number = 10): void {
    this.prodcutsService.getAllProducts(page, pageSize).subscribe(
      (data) => {
        this.products = data.content; // Assuming data contains the users array
        console.log(this.products)
        this.currentPage = data.pageable.pageNumber + 1;
        this.totalPages = Array.from({ length: data.totalPages }, (_, i) => i + 1);
      },
      (error) => {
        console.error('Error fetching users', error);
      }
    );
  }

  deleteProduct(prodId: number): void {
    this.prodcutsService.deleteProduct(prodId).subscribe(
      (data) => {
        // Filter out the deleted user from the array
        this.products = this.products.filter(product => product.productId !== prodId);
        this.dashboardComponent.fetchProductCount(); // Update the product count
        console.log(data);
      },
      (error) => {
        console.error('Error deleting user:', error);
      }
    );
  }

  detailsProdcut(prodId: number): void {
    this.router.navigate([`dashboard/products/${prodId}`]);
  }

  open() {
    const modalRef = this.modalService.open(AddProductComponent, { size: 'lg', centered: true });

    modalRef.componentInstance.userAdded.subscribe(() => {
      this.fetchProducts(); // Refresh the users list
      this.dashboardComponent.fetchUserCount(); // Update the user count
      this.toastService.add('User Added successfully');
    });

    modalRef.result.then(
      (result) => {
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }

  onPageChange(page: number): void {
    this.fetchProducts(page - 1);
  }
}
