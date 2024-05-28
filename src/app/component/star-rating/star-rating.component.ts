// star-rating.component.ts
import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="star-rating">
      <span class="me-3 text-dark">Rate: </span>
      <!-- Static stars with fixed color and size -->
      <i class="fas fa-star static-star" *ngFor="let _ of [1, 2, 3, 4, 5]"></i>
      <!-- Dynamic stars with ngClass -->
      <ng-container *ngFor="let _ of [1, 2, 3, 4, 5]; let i = index">
        <i class="fas dynamic-star" [ngClass]="{'fa-star': i < roundedRating, 'fa-star-o': i >= roundedRating}"></i>
      </ng-container>
   </div>
   `,
  styles: [
    `
      .star-rating {
        display: flex; /* Ensure stars are aligned in a row */
        align-items: center; /* Align stars vertically */
      }

      .static-star,
      .dynamic-star {
        color: grey;
        font-size: 1em; /* Adjust the font size as needed */
        margin-right: 5px; /* Adjust the margin between stars */
      }
      .dynamic-star {
        color: green;
        position: relative;
        left: -116px;
      }
    `,
  ],
  imports: [CommonModule],
})
export class StarRatingComponent {
  private _rating: number = 0.5;

  @Input()
  set rating(value: number) {
    // Round the rating to the nearest whole number
    this._rating = Math.round(value);
  }

  get rating(): number {
    return this._rating;
  }

  get roundedRating(): number {
    return Math.round(this._rating);
  }
}
