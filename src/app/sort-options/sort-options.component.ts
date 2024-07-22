import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductListComponent } from '../component/product-list/product-list.component';
import { NgIf } from '@angular/common';
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