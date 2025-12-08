import { CommonModule } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ToastService } from '../../service/toast.service';
import { ConfigService } from '../../service/config.service';


@Component({
  selector: 'app-modal-content',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './modal-change-pwd.component.html',
  styleUrls: ['./modal-change-pwd.component.css']
})

export class ModalChangePwdComponent {
  changePwdForm: FormGroup;
  responseMessage: string = '';
  successMessage: string = '';

  confirmPasswordBlurred: boolean = false;
  baseUrl: string;

  constructor(
    public dialogRef: MatDialogRef<ModalChangePwdComponent>,
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
      code: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$')]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): { [key: string]: any } | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword ? null : { 'mismatch': true };
  };

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    if (this.changePwdForm.valid) {
      const formValue = this.changePwdForm.getRawValue();
      const url = `${this.baseUrl}/auth/reset?email=${encodeURIComponent(this.data.email)}`;
      const body = {
        password: formValue.password,
        code: formValue.code
      };

      this.http.post(url, body).subscribe(
        (response: any) => {
          this.toastService.add(response.message, 'success');
          this.successMessage = response.message;
          setTimeout(() => {
            this.dialogRef.close();
          }, 2000);
        },
        error => {
          if (error.error.errors) {
            this.responseMessage = Object.values(error.error.errors).join(', ');
          } else {
            this.responseMessage = error.error.message;
          }
        }
      );
    } else {
      this.responseMessage = 'Please Complete Form.';
    }
  }

  onConfirmPasswordBlur(): void {
    this.confirmPasswordBlurred = true;
  }

  onConfirmPasswordFocus(): void {
    this.confirmPasswordBlurred = false;
  }


}
