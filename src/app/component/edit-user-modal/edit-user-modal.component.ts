
import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit-user-modal.component.html',
  styleUrl: './edit-user-modal.component.css'
})
export class EditUserModalComponent {
  @Input() user: any; // Input property for receiving user details
  @Output() userUpdated = new EventEmitter<void>();
  originalUser: any; // To store original user details for comparison or rollback purposes
  userForm!: FormGroup;
  formErrors: any = {};
  errMsg!: string;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.originalUser = { ...this.user };
    this.createForm();
  }

  createForm() {
    this.userForm = this.fb.group({
      firstName: [this.user.firstName, [Validators.required, Validators.pattern(/^\S.*$/)]],
      lastName: [this.user.lastName, [Validators.required, Validators.pattern(/^\S.*$/)]],
      gender: [this.user.gender, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email, Validators.pattern(/^\S.*$/)]],
      oldPassword: ['', [Validators.required, Validators.pattern(/^\S.*$/)]],
      password: ['', [Validators.required, Validators.pattern(/^\S.*$/)]],
    });
  }

  saveChanges() {
    if (this.userForm.invalid) {
      this.displayValidationErrors();
      return;
    }

    this.authService.updateProfile(this.userForm.value).subscribe({
      next: (response) => {
        this.router.navigate(['/user/profile']);
        this.userUpdated.emit();
        if (response !== null) {
          this.activeModal.close('updated');
        }
      },
      error: (error) => {
        console.log(error);
        if (error.status === 400 && error.error.violations) {
          this.displayServerErrors(error.error.violations);
          console.log(error)
        } else {
          this.errMsg = error.error.message || 'An error occurred while updating the profile';
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
    console.log(this.formErrors)
    violations.forEach((violation: any) => {
      this.formErrors[violation.fieldName] = violation.message;
    });
  }

  getErrorMessage(field: string): string {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return 'This field cannot be empty or start with a space.';
      case 'gender':
        return 'Gender is required.';
      case 'email':
        return 'Enter a valid email.';
      case 'oldPassword':
      case 'password':
        return 'Password cannot be empty or start with a space.';
      default:
        return 'This field is required.';
    }
  }

  disableAutocomplete(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('autocomplete', 'off');
    }
  }

  close() {
    Object.assign(this.user, this.originalUser);
    this.activeModal.dismiss('cancel');
  }
}
