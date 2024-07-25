import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomRangeSliderComponent } from "../component/custom-range-slider/custom-range-slider.component";
import { CapitalizePipe } from "../pipe/capitalize.pipe";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, CustomRangeSliderComponent, CapitalizePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() categoryTitle: string | null = null;
  @Input() subCategories: any[] = [];
  @Input() filters: any;
  @Input() colorOptions: string[] = [];
  @Input() subCategoryName: string | null = null;
  
  @Output() colorChange = new EventEmitter<string>();
  @Output() sizeChange = new EventEmitter<string>();
  @Output() priceRangeChange = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  onColorChange(color: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.colorChange.emit(color);
  }

  onSizeChange(size: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.sizeChange.emit(size);
  }

  onPriceRangeChange(): void {
    this.priceRangeChange.emit();
  }
}