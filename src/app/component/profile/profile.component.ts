import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ProfileSellerComponent } from '../profile-seller/profile-seller.component';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { ToastService } from '../../service/toast.service';
import { ProfileAdminComponent } from '../profile-admin/profile-admin.component';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  imports: [
    ProfileAdminComponent,
    ProfileSellerComponent,
    ProfileUserComponent,
    CommonModule,
  ],
})
export class ProfileComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService
  ) {}

  user: any;

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.loadProfile().subscribe((data) => {
        this.user = data;
      });
    }
  }

  removeToast(): void {
    this.toastService.remove();
  }

  showToast(): void {
    this.toastService.add('This is a toast message.');
  }
  auth() {
    return this.authService.isLoggedIn();
  }
}
