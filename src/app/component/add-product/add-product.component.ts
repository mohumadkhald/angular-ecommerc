import { CommonModule, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../service/category.service';
import { ProductsService } from '../../service/products.service';


@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass, NgStyle, NgFor, NgIf],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup | any;
  selectedFile: File | any;
  subCategories: any[] = [];
  fileTouched = false;

  constructor(
      private formBuilder: FormBuilder,
      private productService: ProductsService,
      private categoryService: CategoryService,
      public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productTitle: ['', Validators.required],
      quantity: [null, Validators.required],
      size: ['', Validators.required],
      color: ['', Validators.required],
      price: [null, Validators.required],
      subCategoryId: [0, [Validators.required, greaterThanZeroValidator()]]
    });
    this.loadSubCategories();
  }


  
  onSubmit(): void {
    this.fileTouched = true;

    if (this.productForm.invalid || !this.selectedFile) {
      this.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('productTitle', this.productForm.get('productTitle').value);
    formData.append('quantity', this.productForm.get('quantity').value.toString());
    formData.append('size', this.productForm.get('size').value);
    formData.append('color', this.productForm.get('color').value);
    formData.append('price', this.productForm.get('price').value.toString());
    formData.append('subCategoryId', this.productForm.get('subCategoryId').value);
    formData.append('image', this.selectedFile, this.selectedFile.name);

    this.productService.addProduct(formData).subscribe(
      response => {
        console.log('Product added successfully:', response);
        this.productForm.reset();
        this.selectedFile = null;
        this.fileTouched = false;
        this.activeModal.close('added');
      },
      error => {
        console.error('Error adding product:', error);
      }
    );
  }

  markAllAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(field => {
      const control = this.productForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  loadSubCategories(): void {
    this.categoryService.getAllSubCategories().subscribe(subCategories => {
      this.subCategories = subCategories;
    });
  }

  onClose(): void {
    this.activeModal.close();
  }


}



function greaterThanZeroValidator(): any {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = control.value > 0;
    return isValid ? null : { greaterThanZero: true };
  };
}

