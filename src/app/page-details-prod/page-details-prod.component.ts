import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProductDetailsComponent } from '../dashboard/product-details/product-details.component';
import { PageDetailsComponent } from '../component/page-details/page-details.component';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-page-details-prod',
  standalone: true,
  imports: [CommonModule, ProductDetailsComponent, PageDetailsComponent],
  templateUrl: './page-details-prod.component.html',
  styleUrl: './page-details-prod.component.css',
})
export class PageDetailsProdComponent implements OnInit {

  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  role() {
    return this.authService.getRole();
  }
  
}
