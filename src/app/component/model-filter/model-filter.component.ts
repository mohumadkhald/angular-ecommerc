import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { CustomRangeSliderComponent } from '../custom-range-slider/custom-range-slider.component';

@Component({
  selector: 'app-model-filter',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CapitalizePipe,
    FormsModule,
    CustomRangeSliderComponent,
  ],
  templateUrl: './model-filter.component.html',
  styleUrl: './model-filter.component.css',
})
export class ModelFilterComponent {
  sizeDisplayMap: { [key: string]: string } = {
    small: 'S',
    medium: 'M',
    large: 'L',
    extra_large: 'XL'
  };
  categoryTitle: string | null;
  subCategories: any[];
  filters: any;
  subCategoryName: string | null;
  colorOptions: string[];
  inStockCount: number;
  outOfStockCount: number;
  activeSub: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModelFilterComponent>
  ) {
    this.categoryTitle = data.categoryTitle;
    this.subCategories = data.subCategories;
    this.filters = { ...data.filters }; // clone to avoid mutating parent directly
    this.subCategoryName = data.subCategoryName;
    this.colorOptions = data.colorOptions;
    this.inStockCount = data.inStockCount;
    this.outOfStockCount = data.outOfStockCount;
    this.activeSub = data.subCategoryName;
  }

  ngOnInit(): void { }

  // Just set the active subcategory; don't close yet
  setActiveSub(subName: string): void {
    this.activeSub = subName;
  }

  // Apply all changes at once
  applyFilters(): void {
    this.dialogRef.close({
      subCategoryName: this.activeSub,
      filters: this.filters,
    });
  }

  onColorToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;

    if (input.checked) {
      if (!this.filters.colors.includes(color)) {
        this.filters.colors.push(color);
      }
    } else {
      this.filters.colors = this.filters.colors.filter((c: string) => c !== color);
    }
  }

  onSizeToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const size = input.value;

    if (input.checked) {
      if (!this.filters.sizes.includes(size)) {
        this.filters.sizes.push(size);
      }
    } else {
      this.filters.sizes = this.filters.sizes.filter((s: string) => s !== size);
    }
  }
}

