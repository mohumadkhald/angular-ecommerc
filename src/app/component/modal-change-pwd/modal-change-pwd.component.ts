import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

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
  confirmPasswordBlurred: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalChangePwdComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
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
      const url = `http://localhost:8080/api/auth/reset?email=${encodeURIComponent(this.data.email)}`;
      const body = {
        password: formValue.password,
        code: formValue.code
      };

      this.http.post(url, body).subscribe(
        (response: any) => {
          console.log('Reset email sent successfully:', response);
          this.responseMessage = response.message;
          this.dialogRef.close();
        },
        error => {
          console.error('Error sending reset email:', error);
          if (error.error.errors) {
            this.responseMessage = Object.values(error.error.errors).join(', ');
          } else {
            this.responseMessage = error.error.message;
          }
        }
      );
    } else {
      this.responseMessage = 'Please Check any Error Msg.';
    }
  }

  onConfirmPasswordBlur(): void {
    this.confirmPasswordBlurred = true;
  }

  onConfirmPasswordFocus(): void {
    this.confirmPasswordBlurred = false;
  }
}
