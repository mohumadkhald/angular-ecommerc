
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriesService } from '../../dashboard-service/categories.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.css'
})
export class AddCategoryComponent implements OnInit {
  @Output() categoryAdded = new EventEmitter<void>();

  categoryForm!: FormGroup;
  selectedFile: File | null = null;

  formErrors: any = {};
  errMsg: any;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    public activeModal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      categoryTitle: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/)]],
    });

    // Initialize formErrors based on the form controls
    this.categoryForm.valueChanges.subscribe(() => {
      this.displayValidationErrors();
    });
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
    formData.append('categoryTitle', this.categoryForm.get('categoryTitle')?.value);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.categoriesService.addCategory(formData).subscribe(
      (response) => {
        // Handle successful response
        console.log('Category added successfully:', response);
        this.categoryAdded.emit(); // Emit the event when a user is added
        this.activeModal.close('success');
      },
      (error) => {
        // Handle error response
        console.error('Error adding category:', error);
        if (error.status === 400 && error.error.violations) {
          this.displayServerErrors(error.error.violations);
        } else {
          this.errMsg=error.error.errors.Category;
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