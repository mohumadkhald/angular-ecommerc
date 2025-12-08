import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfigService } from '../../service/config.service';
import { ToastService } from '../../service/toast.service';
import { SetFirstPasswordComponent } from '../set-first-password/set-first-password.component';

@Component({
  selector: 'app-change-pwd',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './change-pwd.component.html',
  styleUrl: './change-pwd.component.css',
})
export class ChangePwdComponent {
  changePwdForm: FormGroup;
  responseMessage: string = '';
  successMessage: string = '';
  confirmPasswordBlurred: boolean = false;
  baseUrl: string;
  errMsg: any;

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
    this.changePwdForm = this.fb.group(
      {
        email: [{ value: data.email, disabled: true }],
        oldPassword: [
          '',[
            Validators.required,
          ]

        ],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$'),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): { [key: string]: any } | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword
      ? null
      : { mismatch: true };
  };

  onOkClick(): void {
    if (this.changePwdForm.valid) {
      const formValue = this.changePwdForm.getRawValue();
      const url = `${this.baseUrl}/auth/changePwd`;
      const body = {
        password: formValue.password,
        oldPassword: formValue.oldPassword
      };

      // token value
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.patch(url, body, { headers }).subscribe(
        (response: any) => {
          setTimeout(
            () => this.toastService.add('The Password Set Success', 'success'),
            3000
          );
          this.successMessage = response.message;
          this.dialogRef.close(); // Close the dialog only on success
        },
        (error) => {
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

  close() {
    this.dialogRef.close();
  }

  disableAutocomplete(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('autocomplete', 'off');
    }
  }
}
