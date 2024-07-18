import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  showStats: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.showStats = this.router.url === '/dashboard';

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showStats = event.url === '/dashboard';
      }
    });
  }
}
