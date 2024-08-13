import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CapitalizePipe } from "../../pipe/capitalize.pipe";
import { CustomRangeSliderComponent } from "../custom-range-slider/custom-range-slider.component";

@Component({
  selector: 'app-model-filter',
  standalone: true,
  imports: [CommonModule, RouterLink, CapitalizePipe, FormsModule, CustomRangeSliderComponent],
  templateUrl: './model-filter.component.html',
  styleUrl: './model-filter.component.css'
})
export class ModelFilterComponent {
  categoryTitle: string | null;
  subCategories: any[];
  filters: any;
  subCategoryName: string | null;
  colorOptions: string[];
  inStockCount: number;
  outOfStockCount: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModelFilterComponent>,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.categoryTitle = data.categoryTitle;
    this.subCategories = data.subCategories;
    this.filters = data.filters;
    this.subCategoryName = data.subCategoryName;
    this.colorOptions = data.colorOptions;
    this.inStockCount = data.inStockCount;
    this.outOfStockCount = data.outOfStockCount;
  }

  ngOnInit(): void {

  }

  onFilterChange(): void {
    // Update query params with availability filters
    this.dialogRef.close({
      filters: {
        inStock: this.filters.inStock,
        notAvailable: this.filters.notAvailable
      }
    });
  }

  onPriceRangeChange(): void {
    this.dialogRef.close({
      filters: {
        minPrice: this.filters.minPrice,
        maxPrice: this.filters.maxPrice
      }
    });
  }

  onColorChange(color: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filters.colors.push(color);
    } else {
      const index = this.filters.colors.indexOf(color);
      if (index > -1) {
        this.filters.colors.splice(index, 1);
      }
    }
    this.dialogRef.close({ filters: { colors: this.filters.colors } });
  }

  onSizeChange(size: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filters.sizes.push(size);
    } else {
      const index = this.filters.sizes.indexOf(size);
      if (index > -1) {
        this.filters.sizes.splice(index, 1);
      }
    }
    this.dialogRef.close({ filters: { sizes: this.filters.sizes } });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.handleScreenResize(event.target.innerWidth);
  }

  private handleScreenResize(width: number): void {
    if (width >= 767) {
      this.dialogRef.close();
    }
  }

}