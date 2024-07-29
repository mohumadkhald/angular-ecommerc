import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SubCategoriesService } from '../../dashboard-service/sub-categories.service';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from '../categories/categories.component';
import { CategoriesService } from '../../dashboard-service/categories.service';

@Component({
  selector: 'app-add-sub-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-sub-category.component.html',
  styleUrl: './add-sub-category.component.css',
})
export class AddSubCategoryComponent {
  @Output() categoryAdded = new EventEmitter<void>();

  categoryForm!: FormGroup;
  selectedFile: File | null = null;

  formErrors: any = {};
  errMsg: any;
  categories!: any[];

  constructor(
    private fb: FormBuilder,
    private subCategoriesService: SubCategoriesService,
    public activeModal: NgbActiveModal,
    public CategoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.pattern(/^(?!\s).*$/)],
      ],
      categoryId: [
        '',
        [Validators.required, Validators.pattern(/^(?!\s).*$/)],
      ],
    });

    // Initialize formErrors based on the form controls
    this.categoryForm.valueChanges.subscribe(() => {
      this.displayValidationErrors();
    });

    this.CategoriesService.getAllCategories().subscribe(
      (categoriesData) => {
        this.categories = categoriesData;
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.displayValidationErrors();
      return;
    }

    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')?.value);
    formData.append('categoryId', this.categoryForm.get('categoryId')?.value);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.subCategoriesService.addSubCategory(formData).subscribe(
      (response) => {
        // Handle successful response
        console.log('Category added successfully:', response);
        this.categoryAdded.emit(); // Emit the event when a user is added
        this.activeModal.close('success');
      },
      (error) => {
        // Handle error response
        if (error.status === 400 && error.error.violations) {
          this.displayServerErrors(error.error.violations);
        } else {
          this.errMsg = error.error.errors.Sub_Category;
        }
      }
    );
  }

  displayValidationErrors() {
    this.formErrors = {};
    for (const field in this.categoryForm.controls) {
      const control = this.categoryForm.get(field);
      if (control && control.invalid && (control.touched || control.dirty)) {
        this.formErrors[field] = this.getErrorMessage(field);
        console.log(`Error for ${field}:`, this.formErrors[field]); // Debugging line
      }
    }
  }

  displayServerErrors(violations: any) {
    this.formErrors = {};
    violations.forEach((violation: any) => {
      this.formErrors[violation.fieldName] = violation.message;
    });
  }

  getErrorMessage(field: string): string {
    switch (field) {
      case 'categoryTitle':
        return 'This field cannot be empty or start with a space.';
      case 'categoryDescription':
        return 'This field is required.';
      default:
        return 'This field is required.';
    }
  }

  close(): void {
    this.activeModal.close();
  }
}
