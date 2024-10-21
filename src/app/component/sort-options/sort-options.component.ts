import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sort-options',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sort-options.component.html',
  styleUrl: './sort-options.component.css',
})
export class SortOptionsComponent {
  @Input() currentSortOption: string = 'createdAtDesc';
  @Input() currentEmailSeller: string = '';
  @Input() emailSellers: any;

  @Output() sortChange = new EventEmitter<string>();
  @Output() emailChange = new EventEmitter<string>();

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value; // Get the selected value
    this.sortChange.emit(value); // Emit the selected value as a string
  }

  onEmailChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      const value = target.value;
      this.emailChange.emit(value);
    }
  }
}
