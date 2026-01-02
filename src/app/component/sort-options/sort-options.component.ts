import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../dashboard-service/products.service';
import { SubCategoriesService } from '../../dashboard-service/sub-categories.service';

@Component({
  selector: 'app-sort-options',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sort-options.component.html',
  styleUrl: './sort-options.component.css',
})
export class SortOptionsComponent implements OnInit {
  subCats: any;
  emailSellers: any;
  @Input() currentElementSizeOption: string = '';
  @Input() currentSortOption: string = 'createdAtDesc';
  @Input() currentEmailSeller: string = '';
  @Input() currentCategory: any = '';
  @Input() currentSubCat: string = '';
  @Input() showSubCatDropdown: boolean = false;
  @Input() showEmailDropdown: boolean = true;

  @Output() elementChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() emailChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() subCatChange = new EventEmitter<string>();

  constructor(
    private productsService: ProductsService,
    private subCateogyService: SubCategoriesService
  ) {}
  ngOnInit(): void {
    this.getEmailsSellers();
    // this.getSubCats();
  }

  onSizeElementChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value; // Get the selected value
    this.elementChange.emit(value); // Emit the selected value as a string
  }

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

  onSubCatChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      const value = target.value;
      this.subCatChange.emit(value);
    }
  }

  getEmailsSellers() {
    // Set currentCategory to 0 if it's not defined or null
    const category = this.currentCategory || 1;
  
    this.productsService.getEmailsSellers(category).subscribe(
      (response: any) => {
        this.emailSellers = response;
      },
      (error) => {
        console.error('Error getting emails of sellers:', error);
      }
    );
  }
  
  getSubCats() {
    this.subCateogyService.getAllSubCategories().subscribe(
      (response: any) => {
        this.subCats = response;
        console.log('Subcategories:', this.subCats);
      },
      (error) => {
        console.error('Error getting emails of sellers:', error);
      }
    );
  }
}
