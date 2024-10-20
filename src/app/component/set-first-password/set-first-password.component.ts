import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastService } from '../../service/toast.service';
import { ConfigService } from '../../config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-set-first-password',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './set-first-password.component.html',
  styleUrl: './set-first-password.component.css'
})


export class SetFirstPasswordComponent {
  changePwdForm: FormGroup;
  responseMessage: string = '';
  successMessage: string = '';
  confirmPasswordBlurred: boolean = false;
  baseUrl: string;

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SetFirstPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpClient,
    public toastService: ToastService,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.getApiUri();
    this.dialogRef.disableClose = true;
    this.changePwdForm = this.fb.group({
      email: [{ value: data.email, disabled: true }],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$')]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): { [key: string]: any } | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { 'mismatch': true };
  };

  onOkClick(): void {
    if (this.changePwdForm.valid) {
      const formValue = this.changePwdForm.getRawValue();
      const url = `${this.baseUrl}/auth/setFirstPwd`;
      const body = {
        password: formValue.password,
      };

      // token value
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.patch(url, body, { headers }).subscribe(
        (response: any) => {
          setTimeout(() => this.toastService.add("the password set successes"), 3000);
          this.successMessage = response.message;
          localStorage.setItem("newUser", "false")
          this.dialogRef.close(); // Close the dialog only on success
        },
        error => {
          console.error('Error setting password:', error);
          if (error.error.errors) {
            this.responseMessage = Object.values(error.error.errors).join(', ');
          } else {
            this.responseMessage = error.error.message;
          }
        }
      );
    }
  }

  onConfirmPasswordBlur(): void {
    this.confirmPasswordBlurred = true;
  }

  onConfirmPasswordFocus(): void {
    this.confirmPasswordBlurred = false;
  }

  removeToast(): void {
    this.toastService.remove();
  }

  showToast(): void {
    this.toastService.add('This is a toast message.');
  }
}
