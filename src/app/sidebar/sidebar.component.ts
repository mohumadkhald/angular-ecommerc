import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    FormsModule, CommonModule, ReactiveFormsModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  openSubLists: { [key: string]: boolean } = {};
  filters = {
    inStock: true,
    notAvailable: false,
    priceRange: 500
  };

  toggleSubList(key: string): void {
    // Close all other sublists
    for (const sublist in this.openSubLists) {
      if (sublist !== key) {
        this.openSubLists[sublist] = false;
      }
    }
    // Toggle the selected sublist
    this.openSubLists[key] = !this.openSubLists[key];
  }
}
