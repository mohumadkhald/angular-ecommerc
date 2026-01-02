import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../service/category.service';
import { combineLatest } from 'rxjs';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CustomRangeSliderComponent } from '../../component/custom-range-slider/custom-range-slider.component';
import { ModelFilterComponent } from '../../component/model-filter/model-filter.component';
import { PaginationComponent } from '../../component/pagination/pagination.component';
import { SortOptionsComponent } from '../../component/sort-options/sort-options.component';
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { Title } from '@angular/platform-browser';

interface Subcategory {
  name: string;
  img: string;
  description?: string;
}

interface Category {
  name: string;
  img: string;
  desc: string;
  subcategories: Subcategory[];
}
@Component({
  selector: 'app-cats',
  standalone: true,
  imports: [CommonModule, RouterLink, CapitalizePipe],
  templateUrl: './cats.component.html',
  styleUrl: './cats.component.css',
})
export class CatsComponent implements OnInit {
  category: Category = {
    name: '',
    img: '',
    desc: '',
    subcategories: [],
  };

  currentSlide = 0;
  autoSlideInterval: any;
  categoryTitle!: string | null;
  title = this.categoryTitle;
  animate = false;


  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    // this.startAutoSlide();

    combineLatest([this.route.paramMap, this.route.queryParams]).subscribe(
      ([paramMap]) => {
        this.categoryTitle = paramMap.get('categoryTitle');
        this.updatePageTitle();

        if (this.categoryTitle) {
          this.loadCategoryAndSubCategories(this.categoryTitle);
        }
      }
    );
      setInterval(() => {
    this.animate = false;
    setTimeout(() => this.animate = true, 50);
  }, 2500);
  }
  private updatePageTitle(): void {
    this.titleService.setTitle(`${this.categoryTitle || ''}`);
  }

  loadCategoryAndSubCategories(categoryTitle: string) {
    this.categoryService
      .getSubCategoriesByCategoryTitle(categoryTitle)
      .subscribe({
        next: (res: any) => {
          // Assuming res has { name, imageUrls, subcategories }
          this.category.name = res.categoryTitle;
          this.category.img = res.img
          this.category.desc = res.description;
          this.category.subcategories = res.subCategoryDtos || [];
          // console.log(res);
        },
        error: (err) => {
          console.error('Failed to load category:', err);
          // Optionally handle 404 or show a not-found component
        },
      });
  }


}
