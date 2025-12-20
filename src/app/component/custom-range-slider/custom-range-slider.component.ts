import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-range-slider',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './custom-range-slider.component.html',
  styleUrl: './custom-range-slider.component.css'
})
export class CustomRangeSliderComponent {
  @Input() min: number = 0;
  @Input() max: number = 25000;
  @Input() step: number = 10;
  @Input() minValue: number = 0;
  @Input() maxValue: number = 25000;
  @Output() minValueChange = new EventEmitter<number>();
  @Output() maxValueChange = new EventEmitter<number>();

  onMinInputChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    if (value > this.maxValue) {
      this.minValue = this.maxValue;
    } else {
      this.minValue = value;
    }
    this.minValueChange.emit(this.minValue);
    this.updateSliderBackground();
  }

  onMaxInputChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    if (value < this.minValue) {
      this.maxValue = this.minValue;
    } else {
      this.maxValue = value;
    }
    this.maxValueChange.emit(this.maxValue);
    this.updateSliderBackground();
  }

updateSliderBackground(): string {
  const minPercent =
    ((this.minValue - this.min) / (this.max - this.min)) * 100;

  const maxPercent =
    ((this.maxValue - this.min) / (this.max - this.min)) * 100;

  return `linear-gradient(
    to right,
    #ddd ${minPercent}%,
    #37475A ${minPercent}%,
    #007bff ${maxPercent}%,
    #ddd ${maxPercent}%
  )`;
}

}
