import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sort-options',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sort-options.component.html',
  styleUrl: './sort-options.component.css'
})
export class SortOptionsComponent {
  @Input() currentSortOption: string = 'createdAtDesc';
  @Output() change = new EventEmitter<Event>();

  onSortChange(event: Event): void {
    this.change.emit(event);
  }
}