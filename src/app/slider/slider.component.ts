import {AfterViewInit, Component, OnInit} from '@angular/core';
import Swiper from "swiper";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent implements OnInit, AfterViewInit {
  categories = [
    { name: 'Category 1', content: 'Content for category 1...' },
    { name: 'Category 2', content: 'Content for category 2...' },
    // Add more categories as needed
  ];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    new Swiper('.swiper-container', {
      direction: 'horizontal',
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
}
