import {Component, Inject, Renderer2} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog} from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ModalChangePwdComponent} from "../modal-change-pwd/modal-change-pwd.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-modal-content',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinner
  ],
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.css']
})
export class ModalContentComponent {
  email: string | undefined;
  responseMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<ModalContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private dialog: MatDialog,
    private renderer: Renderer2 // Inject Renderer2 for styling
  ) {
    this.dialogRef.disableClose = true;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  loading: boolean = false;
  onOkClick(): void {
    if (this.email) {
      this.loading = true; // Start the spinner
      const url = `http://localhost:8080/api/auth/send-reset?email=${encodeURIComponent(this.email)}`;
      this.http.post(url, {})
        .subscribe((response: any) => {
          console.log('Reset email sent successfully:', response);
          this.responseMessage = response.message;
          this.loading = false; // Stop the spinner
          this.dialogRef.close();
          this.openChangePwdModal(this.email);
        }, error => {
          console.error('Error sending reset email:', error);
          this.loading = false; // Stop the spinner
          if (error && error.error && error.error.message) {
            this.responseMessage = error.error.message;
          } else {
            this.responseMessage = 'An error occurred while sending the reset email.';
          }
        });
    }
  }


  openChangePwdModal(email: string | undefined): void {
    const dialogRef = this.dialog.open(ModalChangePwdComponent, {
      width: '400px',
      data: { email: email, name: 'Change Password' },
      panelClass: 'custom-dialog-container'  // Apply the custom class here
    });

    dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector('.cdk-overlay-pane') as HTMLElement;
      // Hide the dialog initially
      dialogContainer.style.display = 'none';
      // Apply new styles to the dialog container
      this.renderer.setStyle(dialogContainer, 'position', 'relative');
      this.renderer.setStyle(dialogContainer, 'top', '20px');
      this.renderer.setStyle(dialogContainer, 'z-index', '100');
      // Show the dialog after applying styles
      dialogContainer.style.display = 'block';
    });
  }
}
