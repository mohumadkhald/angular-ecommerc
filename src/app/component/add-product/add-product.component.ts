import { CommonModule, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../service/category.service';
import { ProductService } from '../../service/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass, NgStyle, NgFor, NgIf],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent implements OnInit {
  @Output() productAdded = new EventEmitter<void>();
  @Input() product!: any;

  productForm: FormGroup | any;
  selectedFiles: File[] = [];
  fileTouched = false;

  subCategories: any[] = [];
  categories: any[] = [];
  filteredSubCategories: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productTitle: ['', Validators.required],
      quantity: [0, [Validators.required, greaterThanZeroValidator()]],
      size: ['', Validators.required],
      color: ['', Validators.required],
      price: [0, [Validators.required, greaterThanZeroValidator()]],
      discountPercent: [0, [Validators.required, zeroOrMoreValidator()]],
      subCategoryId: [0, [Validators.required, greaterThanZeroValidator()]],
      categoryId: [0, [Validators.required, greaterThanZeroValidator()]],
    });

    this.loadSubCategories();
    this.loadCategories();
  }

  onSubmit(): void {
    this.fileTouched = true;

    if (this.productForm.invalid || this.selectedFiles.length === 0) {
      this.markAllAsTouched();
      return;
    }

    if (this.selectedFiles.length < 5 || this.selectedFiles.length > 10) {
      alert('Please upload between 5 and 10 images.');
      return;
    }

    const formData = new FormData();
    formData.append('productTitle', this.productForm.get('productTitle').value);
    formData.append(
      'quantity',
      this.productForm.get('quantity').value.toString()
    );
    formData.append('size', this.productForm.get('size').value);
    formData.append('color', this.productForm.get('color').value);
    formData.append('price', this.productForm.get('price').value.toString());
    formData.append(
      'discountPercent',
      this.productForm.get('discountPercent').value.toString()
    );
    formData.append(
      'subCategoryId',
      this.productForm.get('subCategoryId').value
    );
    formData.append('categoryId', this.productForm.get('categoryId').value);

    // Add images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });

    if (this.product) {
      this.productService
        .editProduct(formData, this.product.productId)
        .subscribe(
          () => {
            this.resetForm();
            this.productAdded.emit();
            this.activeModal.close('updated');
          },
          (error) => console.log('Error updating product:', error)
        );
    } else {
      this.productService.addProduct(formData).subscribe(
        () => {
          this.resetForm();
          this.productAdded.emit();
          this.activeModal.close('added');
        },
        (error) => console.log('Error adding product:', error)
      );
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.selectedFiles = [];
    this.fileTouched = false;
  }

  markAllAsTouched(): void {
    Object.keys(this.productForm.controls).forEach((field) => {
      const control = this.productForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }

  imagePreviews: string[] = [];

  onFilesSelected(event: any): void {
    this.fileTouched = true;

    const files = event.target.files as FileList;

    // Keep old files — append new ones
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Prevent duplicates
      if (
        !this.selectedFiles.find(
          (f) => f.name === file.name && f.size === file.size
        )
      ) {
        this.selectedFiles.push(file);
        this.imagePreviews.push(URL.createObjectURL(file));
      }
    }
  }

  loadSubCategories(): void {
    this.categoryService.getAllSubCategories().subscribe((subCategories) => {
      this.subCategories = subCategories;
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  onClose(): void {
    this.activeModal.close();
  }

  onCategoryChange(event: any): void {
    const categoryId = +event.target.value;
    this.filteredSubCategories = this.subCategories.filter(
      (subCategory) => subCategory.categoryId === categoryId
    );

    if (this.filteredSubCategories.length > 0) {
      this.productForm.get('subCategoryId')?.enable();
    } else {
      this.productForm.get('subCategoryId')?.disable();
    }
  }
}

function greaterThanZeroValidator(): any {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value > 0 ? null : { greaterThanZero: true };
  };
}

function zeroOrMoreValidator(): any {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value >= 0 ? null : { zeroOrMore: true };
  };
}
