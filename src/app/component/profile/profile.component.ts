import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../service/auth.service';
import { ProfileSellerComponent } from '../profile-seller/profile-seller.component';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { ToastService } from '../../service/toast.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    imports: [ProfileSellerComponent, ProfileUserComponent, CommonModule]
})
export class ProfileComponent implements OnInit{

  constructor(private authService: AuthService, private router: Router, private toastService: ToastService) {}

  user:any;

  ngOnInit(): void {
      this.authService.getProfile().subscribe(
        response => {
          console.log('profile successful', response);
          this.user = response;
        },
        error => {
          if (error.status === 403) {
            localStorage.removeItem("token");
            this.toastService.add('Your Session has expired Login again');
            setTimeout(() => {
              this.router.navigate([`/login`]);
            }, 3000);
          }
        }
      );
  }

  removeToast(): void {
    this.toastService.remove();
  }

  showToast(): void {
    this.toastService.add('This is a toast message.');
  }

}
