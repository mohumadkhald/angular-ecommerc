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
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css',
})
export class EditProductComponent implements OnInit {
  @Output() productAdded = new EventEmitter<void>();
  @Input() product!: any;

  productForm: FormGroup | any;
  selectedFile: File | null = null;
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
      productTitle: [this.product?.productTitle ?? '', Validators.required],
      price: [
        this.product?.price ?? 0,
        [Validators.required, greaterThanZeroValidator()],
      ],
      discountPercent: [
        this.product?.discountPercent ?? 0,
        [Validators.required, zeroOrMoreValidator()],
      ],
      subCategoryId: [
        this.product?.subCategory.id ?? 0,
        [Validators.required, greaterThanZeroValidator()],
      ],
      categoryId: [
        this.product?.subCategory.categoryId ?? 0,
        [Validators.required, greaterThanZeroValidator()],
      ],
    });
    this.loadCategories();
    this.loadSubCategories(() => {
      // Automatically trigger category change if the product has a subcategory on load
      const categoryId = this.productForm.get('categoryId')?.value;
      if (categoryId) {
        this.filterSubCategories(categoryId);
      }
    });

    console.log(this.product?.subCategory.id);
  }

  onSubmit(): void {
    this.fileTouched = true;

    if (this.productForm.invalid || !this.selectedFile) {
      this.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('productTitle', this.productForm.get('productTitle').value);
    formData.append(
      'discountPercent',
      this.productForm.get('discountPercent').value.toString()
    );
    formData.append('price', this.productForm.get('price').value.toString());
    formData.append(
      'subCategoryId',
      this.productForm.get('subCategoryId').value
    );
    formData.append('categoryId', this.productForm.get('categoryId').value);
    formData.append('image', this.selectedFile, this.selectedFile.name);

    if (this.product) {
      this.productService
        .editProduct(formData, this.product.productId)
        .subscribe(
          () => {
            this.productForm.reset();
            this.selectedFile = null;
            this.fileTouched = false;
            this.productAdded.emit();
            this.activeModal.close('updated');
          },
          (error) => {
            console.log('Error adding product:', error);
          }
        );
    }
  }

  markAllAsTouched(): void {
    Object.keys(this.productForm.controls).forEach((field) => {
      const control = this.productForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }

  onFileSelected(event: any, fileType: string): void {
    const file = event.target.files[0] as File;
    if (fileType === 'image') {
      this.selectedFile = file;
    }
  }

  loadSubCategories(callback?: () => void): void {
    this.categoryService.getAllSubCategories().subscribe((subCategories) => {
      this.subCategories = subCategories;
      if (callback) callback(); // Execute the callback after loading
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
    this.filterSubCategories(categoryId);
  }

  filterSubCategories(categoryId: number): void {
    this.filteredSubCategories = this.subCategories.filter(
      (subCategory) => subCategory.categoryId === categoryId
    );

    // If the selected subcategory is not in the new list, reset it
    const currentSubCategoryId = this.productForm.get('subCategoryId')?.value;
    if (
      !this.filteredSubCategories.some((sc) => sc.id === currentSubCategoryId)
    ) {
      this.productForm.get('subCategoryId')?.setValue(0);
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
