import { CommonModule, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../service/category.service';
import { ProductService } from '../../service/product.service';


@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass, NgStyle, NgFor, NgIf],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  @Output() productAdded = new EventEmitter<void>();
  @Input() product!: any;

  productForm: FormGroup | any;
  selectedFile: File | null = null;
  selectedFile1: File | null = null;
  fileTouched = false;
  fileTouched1 = false;
  subCategories: any[] = [];
  categories: any[] = [];
  filteredSubCategories: any[] = [];



  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productTitle: ['', Validators.required],
      quantity: [0, [Validators.required, greaterThanZeroValidator()]],
      size: ['', Validators.required],
      color: ['', Validators.required],
      price: [0, [Validators.required, greaterThanZeroValidator()]],
      discountPercent: [0, [Validators.required, zeroOrMoreValidator()]],
      subCategoryId: [0, [Validators.required, greaterThanZeroValidator()]],
      categoryId: [0, [Validators.required, greaterThanZeroValidator()]]

    });
    this.loadSubCategories();
    this.loadCategories();

  }

  onSubmit(): void {
    this.fileTouched = true;
    this.fileTouched1 = true;

    if (this.productForm.invalid || !this.selectedFile || !this.selectedFile1) {
      this.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('productTitle', this.productForm.get('productTitle').value);
    formData.append('quantity', this.productForm.get('quantity').value.toString());
    formData.append('size', this.productForm.get('size').value);
    formData.append('color', this.productForm.get('color').value);
    formData.append('price', this.productForm.get('price').value.toString());
    formData.append('discountPercent', this.productForm.get('discountPercent').value.toString());
    formData.append('subCategoryId', this.productForm.get('subCategoryId').value);
    formData.append('categoryId', this.productForm.get('categoryId').value);
    formData.append('image', this.selectedFile, this.selectedFile.name);
    formData.append('image1', this.selectedFile1, this.selectedFile1.name);

    if(this.product){
      this.productService.editProduct(formData, this.product.productId).subscribe(
        () => {
          this.productForm.reset();
          this.selectedFile = null;
          this.selectedFile1 = null;
          this.fileTouched = false;
          this.fileTouched1 = false;
          this.productAdded.emit();
          this.activeModal.close('updated');
        },
        error => {
          console.log('Error adding product:', error);
        }
      );
    } else {
      this.productService.addProduct(formData).subscribe(
        () => {
          this.productForm.reset();
          this.selectedFile = null;
          this.selectedFile1 = null;
          this.fileTouched = false;
          this.fileTouched1 = false;
          this.productAdded.emit();
          this.activeModal.close('added');
        },
        error => {
          console.log('Error adding product:', error);
        }
      );
    }


  }

  markAllAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(field => {
      const control = this.productForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }

  onFileSelected(event: any, fileType: string): void {
    const file = event.target.files[0] as File;
    if (fileType === 'image') {
      this.selectedFile = file;
    } else if (fileType === 'image1') {
      this.selectedFile1 = file;
    }
  }

  loadSubCategories(): void {
    this.categoryService.getAllSubCategories().subscribe(subCategories => {
      this.subCategories = subCategories;
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
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

    // Enable or disable the subcategory dropdown based on the result
    if (this.filteredSubCategories.length > 0) {
      this.productForm.get('subCategoryId')?.enable();
    } else {
      this.productForm.get('subCategoryId')?.disable();
    }
  }
}

function greaterThanZeroValidator(): any {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = control.value > 0;
    return isValid ? null : { greaterThanZero: true };
  };
}

function zeroOrMoreValidator(): any {
  return (control: AbstractControl): ValidationErrors | null => {
    const isValid = control.value >= 0;
    return isValid ? null : { greaterOrEquelThanZero: true };
  };
}