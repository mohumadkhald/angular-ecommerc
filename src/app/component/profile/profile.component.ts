import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ProfileSellerComponent } from '../../profile-seller/profile-seller.component';
import { ProfileUserComponent } from '../../profile-user/profile-user.component';
import { AuthService } from '../../service/auth.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    imports: [ProfileSellerComponent, ProfileUserComponent, CommonModule]
})
export class ProfileComponent implements OnInit{

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
