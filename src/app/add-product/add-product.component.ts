import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../service/category.service';
import { ProductsService } from '../service/products.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup | any;
  selectedFile: File | any;
  subCategories: any[] = [];


  constructor(
      private formBuilder: FormBuilder,
      private productService: ProductsService,
      private categoryService: CategoryService,
      public activeModal: NgbActiveModal
    ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productTitle: ['', Validators.required],
      quantity: [null, Validators.required],
      size: ['', Validators.required],
      color: ['', Validators.required],
      price: [null, Validators.required],
      subCategoryId: [null, Validators.required]
    });
    this.loadSubCategories();
  }

  onSubmit(): void {
    if (this.productForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('productTitle', this.productForm.get('productTitle').value);
      formData.append('quantity', this.productForm.get('quantity').value.toString());
      formData.append('size', this.productForm.get('size').value);
      formData.append('color', this.productForm.get('color').value);
      formData.append('price', this.productForm.get('price').value.toString());
      formData.append('subCategoryId', this.productForm.get('subCategoryId').value);
      formData.append('image', this.selectedFile, this.selectedFile.name);

      // Call your service method to add the product
      this.productService.addProduct(formData).subscribe(
        response => {
          // Handle success
          console.log('Product added successfully:', response);
          // Optionally reset the form
          this.productForm.reset();
          this.activeModal.close();
        },
        error => {
          // Handle error
          console.error('Error adding product:', error);
        }
      );
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  loadSubCategories(): void {
    this.categoryService.getAllSubCategories().subscribe(subCategories => {
      this.subCategories = subCategories;
    });
  }



}