import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.css'
})
export class ProfileUserComponent {
  constructor(private authService: AuthService, private router: Router) {}

  user:any;

  ngOnInit(): void {
      this.authService.getProfile().subscribe(
        response => {
          console.log('profile successful', response);
          this.user = response;
        },
        error => {
          console.error('profile error', error);
        }
      );
  }
}
