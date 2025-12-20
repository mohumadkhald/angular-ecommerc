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
    public dialogRef: MatDialogRef<ModelFilterComponent>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryTitle = data.categoryTitle;
    this.subCategories = data.subCategories;
    this.filters = data.filters;
    this.subCategoryName = data.subCategoryName;
    this.colorOptions = data.colorOptions;
    this.inStockCount = data.inStockCount;
    this.outOfStockCount = data.outOfStockCount;
    this.activeSub = data.sub;
  }

  ngOnInit(): void {}

  setActiveSub(subName: string): void {
    this.activeSub = subName;
  }
  onFilterChange(): void {
    // Update query params with availability filters
    this.dialogRef.close({
      filters: {
        inStock: this.filters.inStock,
        notAvailable: this.filters.notAvailable,
      },
    });
  }

  onPriceRangeChange(): void {
    this.dialogRef.close({
      filters: {
        minPrice: this.filters.minPrice,
        maxPrice: this.filters.maxPrice,
      },
    });
  }

  // onColorChange(color: string, event: Event): void {
  //   const checkbox = event.target as HTMLInputElement;
  //   if (checkbox.checked) {
  //     this.filters.colors.push(color);
  //   } else {
  //     const index = this.filters.colors.indexOf(color);
  //     if (index > -1) {
  //       this.filters.colors.splice(index, 1);
  //     }
  //   }
  //   this.updateQueryParams({ color: this.filters.colors.join(',') });
  //   this.dialogRef.close({ filters: { colors: this.filters.colors } });
  // }

  onColorToggle(color: string, event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.checked) {
      if (!this.filters.colors.includes(color)) {
        this.filters.colors.push(color);
      }
    } else {
      this.filters.colors = this.filters.colors.filter(
        (c: string) => c !== color
      );
    }
  }

  applyColorFilter(): void {
    this.updateQueryParams({
      colors: this.filters.colors.join(','),
    });

    this.dialogRef.close({
      filters: { sizes: this.filters.sizes },
    });
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

  applySizeFilter(): void {
    this.updateQueryParams({
      sizes: this.filters.sizes.join(','),
    });

    this.dialogRef.close({
      filters: { sizes: this.filters.sizes },
    });
  }

  updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
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
