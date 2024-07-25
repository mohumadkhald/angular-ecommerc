import {Component, Inject, Renderer2} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog} from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ModalChangePwdComponent} from "../modal-change-pwd/modal-change-pwd.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-modal-send-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinner
  ],
  templateUrl: './modal-send-reset-password.component.html',
  styleUrls: ['./modal-send-reset-password.component.css']
})
export class ModalSendResetPasswordComponent {
  emailForm: FormGroup;
  responseMessage: string = '';
  loading: boolean = false;
  submitted: boolean = false;

  // Regular expression pattern for email validation
  emailPattern: string = '^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$';

  constructor(
    public dialogRef: MatDialogRef<ModalSendResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private renderer: Renderer2
  ) {
    this.dialogRef.disableClose = true;
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.submitted = true;

    if (this.emailForm.valid) {
      this.loading = true;
      const email = this.emailForm.get('email')?.value;
      const url = `http://localhost:8080/api/auth/send-reset?email=${encodeURIComponent(email)}`;
      this.http.post(url, {})
        .subscribe((response: any) => {
          console.log('Reset email sent successfully:', response);
          this.responseMessage = response.message;
          this.loading = false;
          this.dialogRef.close();
          this.openChangePwdModal(email);
        }, error => {
          this.loading = false;
          if (error && error.error && error.error.message) {
            this.responseMessage = error.error.message;
          } else {
            this.responseMessage = 'An error occurred while sending the reset email.';
          }
        });
    }
  }

  openChangePwdModal(email: string): void {
    const dialogRef = this.dialog.open(ModalChangePwdComponent, {
      width: '400px',
      data: { email: email, name: 'Change Password' },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector('.cdk-overlay-pane') as HTMLElement;
      dialogContainer.style.display = 'none';
      this.renderer.setStyle(dialogContainer, 'position', 'relative');
      this.renderer.setStyle(dialogContainer, 'top', '20px');
      this.renderer.setStyle(dialogContainer, 'z-index', '100');
      dialogContainer.style.display = 'block';
    });
  }
}
