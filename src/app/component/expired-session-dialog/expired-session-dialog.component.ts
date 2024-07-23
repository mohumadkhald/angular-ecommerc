import { AfterViewInit, Component, Inject, Renderer2 } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-expired-session-dialog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './expired-session-dialog.component.html',
  styleUrl: './expired-session-dialog.component.css'
})
export class ExpiredSessionDialogComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<ExpiredSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    this.dialogRef.afterOpened().subscribe(() => {
      const dialogContainer = document.querySelector('.cdk-overlay-pane') as HTMLElement;
      this.renderer.addClass(dialogContainer, 'expired-session-dialog');
    });
  }
}

