import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../component/interface/product';
import { Prod } from '../../component/interface/product-all-details';
import { ProductsService } from '../../dashboard-service/products.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product!: Prod;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductsService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];
    this.productService.getProductDetails(productId).subscribe(
      (data: Prod) => {
        this.product = data;
      },
      error => {
        console.error('Error fetching product details:', error);
      }
    );
  }

  onUpdate() {
    // Navigate to update product page
    this.router.navigate(['/update-product', this.product.productId]);
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(this.product.productId).subscribe(
        () => {
          alert('Product deleted successfully');
          this.router.navigate(['dashboard/products']); // Redirect to products list after deletion
        },
        error => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        }
      );
    }
  }
}