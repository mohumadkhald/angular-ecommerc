import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsersService } from '../../dashboard-service/users.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {
  @Output() userAdded = new EventEmitter<void>();

  errMsg!: string;
  userForm!: FormGroup;
  formErrors: any = {};

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UsersService
  ) {
    this.createForm();
  }

  createForm() {
    this.userForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern(/^\S.*$/)]],
      lastname: ['', [Validators.required, Validators.pattern(/^\S.*$/)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^\S.*$/)]],
      password: ['', [Validators.required, Validators.pattern(/^\S.*$/)]],
    });
  }

  close() {
    this.activeModal.dismiss('cancel');
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.displayValidationErrors();
      return;
    }

    const token = 'your-auth-token'; // Replace with your actual token

    this.userService.addUser(this.userForm.value, token)
      .subscribe({
        next: (response) => {
          console.log('User added successfully', response);
          this.userAdded.emit(); // Emit the event when a user is added
          this.activeModal.close('success');
        },
        error: (error) => {
          console.error('Error adding user', error);
          if (error.status === 400 && error.error.violations) {
            this.displayServerErrors(error.error.violations);
          } else {
            this.errMsg=error.error.errors.Email;
          }
        }
      });
  }

  displayValidationErrors() {
    for (const field in this.userForm.controls) {
      if (this.userForm.controls[field].invalid) {
        this.formErrors[field] = this.getErrorMessage(field);
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
      case 'firstname':
      case 'lastname':
        return 'This field cannot be empty or start with a space.';
      case 'gender':
        return 'Gender is required.';
      case 'email':
        return 'Enter a valid email.';
      case 'password':
        return 'Password cannot be empty or start with a space.';
      default:
        return 'This field is required.';
    }
  }
}