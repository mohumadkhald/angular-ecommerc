import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number[] = [];
  @Output() pageChange = new EventEmitter<number>();

  private visiblePageRange: { start: number, end: number } = { start: 1, end: 5 };

  get visiblePages(): number[] {
    const pages: number[] = [];
    for (let i = this.visiblePageRange.start; i <= this.visiblePageRange.end; i++) {
      if (i <= this.totalPages.length) {
        pages.push(i);
      }
    }
    return pages;
  }

  get showFirstPage(): boolean {
    return this.visiblePageRange.start > 1;
  }

  get showPreviousEllipsis(): boolean {
    return this.visiblePageRange.start > 2;
  }

  get showNextEllipsis(): boolean {
    return this.visiblePageRange.end < this.totalPages.length - 1;
  }

  get showLastPage(): boolean {
    return this.visiblePageRange.end < this.totalPages.length;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages.length) {
      this.currentPage = page;
      this.pageChange.emit(page);
      this.adjustVisiblePages();
    }
  }

  showNextPages(): void {
    this.visiblePageRange.start = Math.min(this.visiblePageRange.start + 5, this.totalPages.length - 4);
    this.visiblePageRange.end = Math.min(this.visiblePageRange.end + 5, this.totalPages.length);
  }

  showPreviousPages(): void {
    this.visiblePageRange.start = Math.max(this.visiblePageRange.start - 5, 1);
    this.visiblePageRange.end = Math.max(this.visiblePageRange.end - 5, 5);
  }

  private adjustVisiblePages(): void {
    if (this.currentPage < this.visiblePageRange.start || this.currentPage > this.visiblePageRange.end) {
      this.visiblePageRange.start = Math.max(this.currentPage - 2, 1);
      this.visiblePageRange.end = Math.min(this.currentPage + 2, this.totalPages.length);
    }
  }
}

