import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-expired-session-dialog',
  standalone: true,
  templateUrl: './expired-session-dialog.component.html',
  styleUrls: ['./expired-session-dialog.component.css'],
})
export class ExpiredSessionDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ExpiredSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.dialogRef.close();
    }, 2000);
  }
}
